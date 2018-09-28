import mongoose from 'mongoose';
import { sendNewTip } from './tip';
import { User, Task, Domain, Tip } from './db';
import user from './user';
jest.mock('./user');

describe('insert', () => {
  let connection;

  beforeAll(async () => {
    connection = await mongoose.connect(global.__MONGO_URI__);

    const govDomain = new Domain({ domainTitle: 'GOV' });
    await govDomain.save();
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  describe('send new tip', () => {
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
      const senderAddress = '0x0';
      const receiverAddress = '0xabc';
      const userBalance = 10;
      const senderUser = new User({ address: senderAddress });
      const newUser = new User({ address: receiverAddress });

      user.dbGetUserByAlias.mockImplementation(
        address => (address === senderAddress ? senderUser : null),
      );

      const addUser = jest.fn(() => newUser);
      user.dbAddUser.mockImplementation(addUser);

      user.getUserBalance.mockResolvedValue(userBalance);

      await sendNewTip({
        sender: '0x0',
        amount: 5,
        receiver: receiverAddress,
        domain: 'GOV',
      });
      expect(addUser.mock.calls.length).toBe(1);
    });
    it('throws if sender balance is less than tip amount', async () => {
      const senderAddress = '0x0';
      const receiverAddress = '0xabc';
      const userBalance = 1;
      const senderUser = new User({ address: senderAddress });
      const newUser = new User({ address: receiverAddress });

      user.dbGetUserByAlias.mockImplementation(
        address => (address === senderAddress ? senderUser : newUser),
      );

      user.getUserBalance.mockResolvedValue(userBalance);

      try {
        await sendNewTip({
          sender: '0x0',
          amount: 5,
          receiver: receiverAddress,
        });
      } catch (e) {
        expect(e.message).toMatch('No money no honey, sorry');
      }
    });
    it('create new task if not present and tips successfully', async () => {
      const senderAddress = '0x0';
      const receiverAddress = '0xabc';
      const userBalance = 10;
      const senderUser = new User({ address: senderAddress });
      const newUser = new User({ address: receiverAddress });
      const taskTitle = 'non existing task';

      user.dbGetUserByAlias.mockImplementation(
        address => (address === senderAddress ? senderUser : newUser),
      );

      user.getUserBalance.mockResolvedValue(userBalance);

      await sendNewTip({
        sender: '0x0',
        amount: 5,
        receiver: receiverAddress,
        title: taskTitle,
        domain: 'GOV',
      });

      const savedTask = await Task.find({ taskTitle });
      expect(savedTask.length).toEqual(1);
      const savedTip = await Tip.find({ taskId: savedTask });
      expect(savedTip.length).toEqual(1);
    });
  });
});
