import mongoose from 'mongoose';
import { User, Period, Colony, getCurrentUserPeriod } from './db';

describe('db', () => {
  let connection;

  beforeAll(async () => {
    connection = await mongoose.connect(global.__MONGO_URI__);
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  beforeEach(async () => {
    const colony = new Colony();
    await colony.save();
  });

  describe('colony', () => {
    it('returns proper current period id', async () => {
      const colony = await Colony.findOne();
      expect(colony.currentPeriodId).toBe(undefined);
    });

    it('returns proper current period id', async () => {
      const colony = await Colony.findOne();
      colony.periodIds.push(0);
      await colony.save();
      expect(colony.currentPeriodId).toBe(0);
    });
  });
});

describe('getCurrentUserPeriod', async () => {
  let connection;
  let user;

  beforeAll(async () => {
    connection = await mongoose.connect(global.__MONGO_URI__);
    user = new User({
      alias: 'user',
    });
    await user.save();
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  it('throws error if user period is not found', async () => {
    try {
      await getCurrentUserPeriod('user', 0);
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });

  it('returns period correctly', async () => {
    // creating new user period
    const period = new Period({ user, periodId: 0, balance: 0, tips: [] });
    await period.save();

    const periodResponse = await getCurrentUserPeriod('user', 0);
    expect(periodResponse.initialBalance).toBe(0);
    expect(periodResponse.balance).toBe(0);
  });
});
