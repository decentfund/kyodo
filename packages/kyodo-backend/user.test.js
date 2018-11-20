import 'babel-polyfill';
import pick from 'lodash/pick';
import map from 'lodash/map';
import { getCurrentUserPeriod } from './db';
import * as ipfs from './ipfs';
import { delegatePoints, generateFinalUserActivityTasks } from './user';
import Point from './models/Point';
import User from './models/User';
import Tip from './models/Tip';
import { addUserWithBalance } from './test/helpers/user';
import { addTip } from './test/helpers/tip';
import * as colony from './web3/colony';
import {
  connectMongoose,
  clearDb,
  disconnectMongoose,
  createColony,
  createDomain,
} from './test/helpers';

beforeAll(connectMongoose);
beforeEach(clearDb);
afterAll(disconnectMongoose);

describe('send new tip', () => {
  beforeEach(async () => {
    await createColony();
    await createDomain();

    await addUserWithBalance('igor');
    await addUserWithBalance('pasha');
  });

  const unknownUser = {
    alias: 'alina',
  };
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

    const { balance: receiverBalance } = await getCurrentUserPeriod(
      receiver.alias,
      0,
    );
    expect(receiverBalance).toBe(8);
  });
  it('if user does not have enough balance', async () => {
    let error;
    try {
      await delegatePoints({
        sender: 'igor',
        amount: 15,
        receiver: receiver.alias,
      });
    } catch (e) {
      error = e;
    } finally {
      expect(error.message).toMatch(
        "Naaah, you don't have so much points. Your current point balance is 10",
      );
    }
    const points = await Point.find();
    expect(points.length).toBe(0);

    const { balance: currentUserBalance } = await getCurrentUserPeriod(
      'igor',
      0,
    );
    expect(currentUserBalance).toBe(10);
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

