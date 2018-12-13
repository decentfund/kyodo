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

describe('generates final activity tasks properly', async () => {
  let govDomain;
  let user;
  let user2;

  beforeEach(async () => {
    await createColony();
    govDomain = await createDomain();

    // Setting test users
    user = await addUserWithBalance('igor');
    user2 = await addUserWithBalance('pasha');

    await addTip({
      domain: govDomain,
      sender: user,
      receiver: user2,
      amount: 5,
    });
    await addTip({
      domain: govDomain,
      sender: user,
      receiver: user2,
      amount: 3,
    });
    await addTip({
      domain: govDomain,
      sender: user,
      receiver: user2,
      amount: 1,
    });
    await addTip({
      domain: govDomain,
      sender: user2,
      receiver: user,
      amount: 3,
    });
  });

  it('generated tips properly', async () => {
    const tips = await Tip.find();
    expect(tips.length).toBe(4);
  });

  it('works correctly', async () => {
    const specificationHash = '4b2d678840918a007bb0751e09370ba1053ebf52';
    const taskId = 1;
    const taskPotId = 2;
    // mock generateIpfsHash
    const originalGenerateIpfsHash = ipfs.generateIpfsHash;
    ipfs.generateIpfsHash = jest.fn(() => specificationHash);

    // mock
    const originalGetColony = colony.getColony;
    colony.getColony = jest.fn(originalGetColony);
    const colonyMock = {
      createTask: {
        send: jest.fn(async () => ({ eventData: { taskId } })),
      },
      getTask: {
        call: jest.fn(async () => ({ potId: taskPotId })),
      },
      moveFundsBetweenPots: {
        send: jest.fn(),
      },
      getPotBalance: {
        call: jest.fn(async () => ({ balance: 100000 })),
      },
    };
    colony.getColony.mockImplementation(async () => colonyMock);

    await generateFinalUserActivityTasks(user);

    const ipfsParams = ipfs.generateIpfsHash.mock.calls[0][0];

    expect(
      map(ipfsParams, tip =>
        pick(tip, [
          'amount',
          'domain.domainTitle',
          'from.alias',
          'from.address',
          'to.alias',
          'to.address',
        ]),
      ),
    ).toMatchSnapshot();

    const createTaskParams = colonyMock.createTask.send.mock.calls[0][0];
    expect(createTaskParams).toEqual({ domainId: 1, specificationHash });

    const getTaskParams = colonyMock.getTask.call.mock.calls[0][0];
    expect(getTaskParams).toEqual({ taskId });

    const moveFundsBetweenPotsParams =
      colonyMock.moveFundsBetweenPots.send.mock.calls[0][0];
    expect(moveFundsBetweenPotsParams).toEqual({
      fromPot: 1, // Gov domain pot describe in beforeAll
      toPot: taskPotId,
      amount: 25000,
    });

    ipfs.generateIpfsHash = originalGenerateIpfsHash;
    colony.getColony = originalGetColony;
  });
});
