import 'babel-polyfill';
import { Period, Colony, getCurrentUserPeriod } from './db';
import {
  connectMongoose,
  clearDb,
  disconnectMongoose,
  createColony,
  createUser,
} from './test/helpers';

beforeAll(connectMongoose);
beforeEach(clearDb);
afterAll(disconnectMongoose);

describe('db', () => {
  beforeEach(createColony);

  describe('colony', () => {
    it('returns proper current period id', async () => {
      const colony = await Colony.findOne();
      expect(colony.currentPeriodId).toBe(0);
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
  let user;

  beforeEach(async () => {
    user = await createUser();
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
