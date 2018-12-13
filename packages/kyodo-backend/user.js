import web3 from 'web3';
import groupBy from 'lodash/groupBy';
import { Colony, Domain, getColonyById, getCurrentUserPeriod } from './db';
import User from './models/User';
import { createAndSaveNewUserPeriod } from './period';
import Point from './models/Point';
import { ModelError } from './errors';
import { getAllUserTips, getAllTipsInDomain } from './tip';
import Token from '@kyodo/contracts/build/contracts/Token.json';
import * as ipfs from './ipfs';
import { getColony } from './web3/colony';

export const dbAddUser = async ({
  address,
  alias,
  balance,
  domains,
  tasks,
}) => {
  const user = new User({
    address,
    alias,
    balance,
    domains,
    tasks,
    dateCreated: Date.now(),
  });

  await user.save();
  return user;
};

export const addUser = async ({ alias }) => {
  const colony = await Colony.findOne();
  const user = await dbAddUser({ alias });

  await createAndSaveNewUserPeriod({
    periodId: colony.currentPeriodId,
    balance: 0,
    user,
  });
  return user;
};

export const dbGetAllUsers = async () => {
  return await User.find((err, users) => {
    if (err) {
      console.log(err);
      return [];
    }
    return users;
  });
};

export const getAllUsers = async (req, res) => {
  let users = await dbGetAllUsers();
  res.status(200).send(users);
  return users;
};

export const generateFinalUserActivityTasks = async user => {
  // Getting user tips
  const userTips = await getAllUserTips({ user });
  const tipsByDomain = groupBy(userTips, 'domain.domainTitle');

  // Get colony
  const colony = await getColony();

  for (const domain in tipsByDomain) {
    // Get tokens in domain
    const { total: totalInDomain } = await getAllTipsInDomain(domain);

    const tipsInDomain = tipsByDomain[domain]
      .filter(tip => tip.to._id.toString() === user._id.toString())
      .reduce((a, { amount }) => a + amount, 0);

    // Get domain id
    // TODO: Get domain data from blockchain
    const { domainId, potId: domainPotId } = await Domain.findOne({
      domainTitle: domain,
    });

    // Get domain pot balance
    const { balance: domainPotBalance } = await colony.getPotBalance.call({
      potId: domainPotId,
      token: Token.address,
    });

    // FIXME: decimals!!!
    const tokensToReceive = (tipsInDomain / totalInDomain) * domainPotBalance;
    const specificationHash = await ipfs.generateIpfsHash(tipsByDomain[domain]);

    // Create task for user using tips sent and received within domain and domain id
    const {
      eventData: { taskId },
    } = await colony.createTask.send({ specificationHash, domainId });

    const task = await colony.getTask.call({ taskId });

    // Move tokens from domain on new task
    await colony.moveFundsBetweenPots.send({
      fromPot: domainPotId,
      toPot: task.potId,
      amount: tokensToReceive,
      token: Token.address,
    });
  }
};

export const getUserByAddress = async (req, res) => {
  await User.find({ address: req.body.address });
};

export const getUserByAlias = async (req, res) => {
  await User.find({ alias: req.body.alias });
};

export const dbGetUserByAlias = async alias => {
  const user = await User.findOne({ alias });

  if (!user) {
    throw new ModelError('Not found', 'user', alias);
  }
  return user;
};

export const getOrCreateUser = async ({ alias }) => {
  let user;
  try {
    user = await dbGetUserByAlias(alias);
  } catch (e) {
    if (e.message === 'Not found') {
      user = await addUser({ alias });
    }
  }
  return user;
};

export const delegatePoints = async ({ amount, sender, receiver }) => {
  // Verify sender is present and has enough points
  if (!sender) throw Error('No sender specified');
  // Throw error if sender is not present
  const senderUser = await dbGetUserByAlias(sender);

  const balance = await getUserBalance(sender);

  if (balance < amount)
    throw new Error(
      `Naaah, you don't have so much points. Your current point balance is ${balance}`,
    );

  // Get receiver if not present create a new one
  const receiverUser = await getOrCreateUser({ alias: receiver });

  // Create points and pass to user
  const points = new Point({
    amount,
    used: false,
    delegatee: senderUser,
    owner: receiverUser,
  });

  await points.save();

  return points;
};

export const getUserBalance = async alias => {
  const colony = await getColonyById(0);
  const currentPeriodId = colony.periodIds[colony.periodIds.length - 1];
  const { balance } = await getCurrentUserPeriod(alias, currentPeriodId);
  return balance;
};

export const setUserAlias = async ({ user, alias, blockNumber }) => {
  user.alias = alias;
  user.aliasSet = blockNumber;

  await user.save();
  return user;
};

export const addDomainToUser = async (req, res) => {
  // TODO:
};

export const addTaskToUser = async (req, res) => {
  // TODO:
};

export const changeUserAlias = async (req, res) => {
  // TODO:
  // this.getUserByAlias(req.body.alias);
};

export const updateUserAddress = async ({ alias, address }) => {
  if (!web3.utils.isAddress(address))
    throw Error('Address is incorrect, try again');
  const user = await dbGetUserByAlias(alias);
  if (!user) throw Error('Get some tips to get started');
  if (user.address)
    throw Error('Address is already set, I cannot change it by now');

  user.address = address;
  await user.save();
  return user;
};
