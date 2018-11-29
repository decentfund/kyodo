import 'babel-polyfill';
import { sendNewTip } from './tip';
import { User, Task, Tip } from './db';
import * as user from './user';
import { SystemError } from './errors';
import * as period from './period';

import {
  connectMongoose,
  clearDb,
  disconnectMongoose,
  createColony,
  createDomain,
} from './test/helpers';

const originalGetUserBalance = user.getUserBalance;
const originalGetByAlias = user.dbGetUserByAlias;
const originalGetOrCreateUser = user.getOrCreateUser;

beforeAll(connectMongoose);
beforeEach(clearDb);
afterAll(disconnectMongoose);

describe('tipping', () => {
  const knownUser = {
    alias: 'igor',
    address: '0x0',
  };
  const unknownUser = {
    alias: 'alina',
  };

  const existingUserMock = new User(knownUser);
  const newUserMock = new User(unknownUser);

  beforeEach(async () => {
    await createColony();
    await createDomain();

    user.dbGetUserByAlias = jest.fn(originalGetByAlias);
    user.getUserBalance = jest.fn(originalGetUserBalance);
  });

  afterEach(async () => {
    user.dbGetUserByAlias = originalGetByAlias;
    user.getUserBalance = originalGetUserBalance;
    user.getOrCreateUser = originalGetOrCreateUser;
  });

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
  it('adds new receiver and period if not found', async () => {
    // const files = db.collection('domains');
    const senderBalance = 10;
    const sender = existingUserMock;

    user.dbGetUserByAlias.mockImplementation(address => {
      return address === sender.address ? sender : null;
    });

    user.getOrCreateUser = jest.fn(() => newUserMock);

    newUserMock.save = jest.fn();

    User.constructor = jest.fn(() => newUserMock);

    const originalCreateAndSaveNewUserPeriod =
      period.createAndSaveNewUserPeriod;
    period.createAndSaveNewUserPeriod = jest.fn(
      originalCreateAndSaveNewUserPeriod,
    );

    user.getUserBalance = jest.fn(() => senderBalance);

    await sendNewTip({
      sender: '0x0',
      amount: 5,
      receiver: newUserMock.alias,
      domain: 'GOV',
    });
    expect(user.getOrCreateUser.mock.calls.length).toBe(1);
    // TODO: Move to user test
    // expect(period.createAndSaveNewUserPeriod.mock.calls.length).toBe(1);
    // expect(period.createAndSaveNewUserPeriod.mock.calls[0][0]).toEqual({
    // periodId: 0,
    // balance: 0,
    // user: newUserMock,
    // });
    period.createAndSaveNewUserPeriod = originalCreateAndSaveNewUserPeriod;

    user.dbGetUserByAlias = originalGetByAlias;
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
      expect(e.message).toMatch(
        "You have 0 points. But don't worry! You can earn them by making contributions other people find useful. Or just by making me laugh.",
      );
    } finally {
      user.dbGetUserByAlias = originalGetByAlias;
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
    user.dbGetUserByAlias = originalGetByAlias;
  });
  it('throws system error on get user balance and displays proper message in bot', async () => {
    const taskTitle = 'non existing task';
    const sender = existingUserMock;
    const receiver = newUserMock;

    user.dbGetUserByAlias.mockImplementation(
      address => (address === sender.address ? sender : receiver),
    );

    user.getUserBalance.mockImplementation(() => {
      throw new SystemError('Some system error');
    });

    try {
      await sendNewTip({
        sender: '0x0',
        amount: 5,
        receiver: receiver.alias,
        title: taskTitle,
        domain: 'GOV',
      });
    } catch (e) {
      expect(e.message).toMatch(
        'Uh-oh! Something went wrong! Please contact admin from the chat and submit a ticket with details in the repo http://github.com/decentfund/kyodo',
      );
    } finally {
      user.getUserBalance.mockRestore();
      user.dbGetUserByAlias.mockRestore();
    }
  });
});
