import mongoose from 'mongoose';
import { sendNewTip } from './tip';
import { User, Task, Domain, Tip, Colony } from './db';
import user from './user';
jest.mock('./user');

describe('insert', () => {
  let connection;

  beforeAll(async () => {
    connection = await mongoose.connect(global.__MONGO_URI__);

    const govDomain = new Domain({ domainTitle: 'GOV' });
    await govDomain.save();

    const colony = new Colony();
    await colony.save();
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  describe('send new tip', () => {
    const knownUser = {
      alias: 'igor',
      address: '0x0',
    };
    const unknownUser = {
      alias: 'alina',
    };

    const existingUserMock = new User(knownUser);
    const newUserMock = new User(unknownUser);

    it('fails with empty object', async () => {
      try {
        await sendNewTip();
      } catch (e) {
        expect(e.message).toMatch('No sender specified');
      }
    });
    it('fails with 0 amount', async () => {
      try {
        await sendNewTip({ sender: '0x0', amount: 0 });
      } catch (e) {
        expect(e.message).toMatch('No money no honey, sorry');
      }
    });
    it('throws if no sender found', async () => {
      try {
        await sendNewTip({ sender: '0x0', amount: 5 });
      } catch (e) {
        expect(e.message).toMatch('Sender is not registered');
      }
    });
    it('adds new receiver if not found', async () => {
      // const files = db.collection('domains');
      const senderBalance = 10;
      const sender = existingUserMock;
      user.dbGetUserByAlias.mockImplementation(
        address => (address === sender.address ? sender : null),
      );

      const addUser = jest.fn(() => newUserMock);
      user.dbAddUser.mockImplementation(addUser);

      user.getUserBalance.mockResolvedValue(senderBalance);

      await sendNewTip({
        sender: '0x0',
        amount: 5,
        receiver: newUserMock.alias,
        domain: 'GOV',
      });
      expect(addUser.mock.calls.length).toBe(1);
    });
    it('throws if sender balance is less than tip amount', async () => {
      const userBalance = 1;
      const sender = existingUserMock;
      const receiver = newUserMock;
      user.dbGetUserByAlias.mockImplementation(
        address => (address === sender.address ? sender : receiver),
      );

      user.getUserBalance.mockResolvedValue(userBalance);

      try {
        await sendNewTip({
          sender: '0x0',
          amount: 5,
          receiver: receiver.alias,
        });
      } catch (e) {
        expect(e.message).toMatch('No money no honey, sorry');
      }
    });
    it('create new task if not present and tips successfully', async () => {
      const userBalance = 10;
      const taskTitle = 'non existing task';
      const sender = existingUserMock;
      const receiver = newUserMock;

      user.dbGetUserByAlias.mockImplementation(
        address => (address === sender.address ? sender : receiver),
      );

      user.getUserBalance.mockResolvedValue(userBalance);

      const resp = await sendNewTip({
        sender: '0x0',
        amount: 5,
        receiver: receiver.alias,
        title: taskTitle,
        domain: 'GOV',
      });

      const savedTask = await Task.find({ taskTitle });
      expect(savedTask.length).toEqual(1);
      const savedTip = await Tip.find({ task: savedTask });
      expect(savedTip.length).toEqual(1);

      expect(resp.to.address).toEqual(undefined);
    });
  });
});
