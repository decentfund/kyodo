import mongoose from 'mongoose';
import { Domain, Colony, getCurrentUserPeriod } from './db';
import * as db from './db';
import { addUser, delegatePoints } from './user';
const Point = require('./models/Point');
import User from './models/User';
import Period from './models/Period';

describe('insert', () => {
  let connection;

  beforeAll(async () => {
    connection = await mongoose.connect(global.__MONGO_URI__);

    const govDomain = new Domain({ domainTitle: 'GOV' });
    await govDomain.save();

    const colony = new Colony({ colonyId: 0, periodIds: [0] });
    await colony.save();

    // await User.getUpdate();
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  afterEach(async () => {
    await User.remove({});
    await Period.remove({});
  });

  beforeEach(async () => {
    const user = await addUser({ alias: 'igor' });

    // Increasing user balance
    await User.update(
      { _id: user._id },
      { balance: 10, address: '0x0' },
      console.log,
    );

    const currentUserPeriod = await Period.findOne({
      user: user._id,
      periodId: 0,
    });

    await Period.update({ _id: currentUserPeriod._id }, { balance: 10 });
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
    const receiver = newUserMock;
    it('delegates points properly', async () => {
      await delegatePoints({
        sender: 'igor',
        amount: 5,
        receiver: receiver.alias,
      });

      const points = await Point.findOne();
      expect(points.amount).toEqual(5);
      const { balance: currentUserBalance } = await getCurrentUserPeriod(
        'igor',
        0,
      );
      expect(currentUserBalance).toBe(5);
    });
    it('delegates points properly several times', async () => {
      await delegatePoints({
        sender: 'igor',
        amount: 5,
        receiver: receiver.alias,
      });

      await delegatePoints({
        sender: 'igor',
        amount: 3,
        receiver: receiver.alias,
      });

      const { balance: currentUserBalance } = await getCurrentUserPeriod(
        'igor',
        0,
      );
      expect(currentUserBalance).toBe(2);
    });
    it('if user does not have enough balance', async () => {
      try {
        await delegatePoints({
          sender: 'igor',
          amount: 15,
          receiver: receiver.alias,
        });
      } catch (e) {
        expect(e.message).toMatch(
          "Naaah, you don't have so much points. Your current point balance is 10",
        );
      }
    });
    it('displays proper points on delegate', async () => {
      await delegatePoints({
        sender: 'igor',
        amount: 5,
        receiver: receiver.alias,
      });

      const { balance: currentUserBalance } = await getCurrentUserPeriod(
        receiver.alias,
        0,
      );
      expect(currentUserBalance).toBe(5);
    });
  });
});
