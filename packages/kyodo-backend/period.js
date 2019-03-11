import { Period, getColonyById } from './db.js';
import { dbGetAllUsers, getAllUsers } from './user.js';
import { PERIOD_TIME } from './constants/periodTime.js';

let getBalance = () => 0;
if (process.env.NODE_ENV !== 'test') {
  const { getBalance: tokenGetBalance } = require('./token');
  getBalance = tokenGetBalance;
}

let currentPeriod = 0;
console.log('PERIOD', currentPeriod);

export const initPeriod = async (
  blockNumber,
  periodId,
  colonyId,
  periodName,
) => {
  const colony = await getColonyById(colonyId);
  const users = await dbGetAllUsers();
  currentPeriod = periodId;
  colony.periodIds.push(currentPeriod);
  await colony.save();

  users.map(async user => {
    const balance = await getBalance(user.address, blockNumber);
    await createAndSaveNewUserPeriod({
      address: user.address,
      periodId: currentPeriod,
      periodName,
      balance, // current user balance
      tips: 0,
      user,
    });
  });
};

export const createAndSaveNewUserPeriod = async ({
  address,
  periodId,
  balance,
  tips,
  user,
  periodName,
}) => {
  let period = new Period({
    // TODO: Period title
    title: periodName,
    address,
    periodId,
    initialBalance: balance, // current user balance
    user,
    tips,
  });
  await period.save();
  return period;
};

export const clearPeriods = async () => {
  return Period.deleteMany();
};

export const initiateNewPeriod = async (req, res) => {
  // verify all users are present in db
  // fetching users from smart contract

  let users = await dbGetAllUsers();
  currentPeriod++;
  users.map(async user => {
    console.log('USER INSIDE LOOP', user);
    let period = new Period({
      title: req.body.title,
      address: user.address,
      periodId: currentPeriod,
      initialBalance: user.balance, // TODO: get the real user's balance and put it here
      tips: 0,
      user,
    });
    await period.save();
  });
  res
    .status(200)
    .send(
      `Successfully initiated first period of a colony, let the game begin!!!`,
    );
};

export const getAllPeriods = async (req, res) => {
  let periods = await Period.find((err, periods) => {
    if (err) return console.error(err);
    res.status(200).send(periods);
  });
  return periods;
};

export const getCurrentPeriod = async (req, res) => {
  const period = await Period.find({ periodId: currentPeriod });
  res.status(200).send(period);
};

export const getCurrentPeriodSummary = async (req, res) => {
  const periodInfo = await Period.findOne({ periodId: currentPeriod });
  const periodBalance = await Period.aggregate([
    { $match: { periodId: currentPeriod } },
    {
      $group: {
        _id: null,
        initialBalance: { $sum: '$initialBalance' },
      },
    },
    { $project: { _id: 0, initialBalance: 1 } },
  ]);

  const balanceInfo = periodBalance[0] || {};
  const periodTitle = periodInfo ? periodInfo.title : '';
  const result = {
    periodTitle,
    initialBalance: balanceInfo.initialBalance || 0,
  };
  res.status(200).send(result);
};

// exports.getUserPeriodBalance = async () => {};

export const getUserByAddressInPeriod = async address => {
  let user = await Period.find(
    {
      address: address,
    },
    (err, user) => {
      if (err) console.log(err);
      return user;
    },
  );
  return user;
};

//MEGA CRON
export const beginTheColonyCountdown = async (req, res) => {
  setTimeout(async () => {
    await initiateNewPeriod(req, res);
  }, PERIOD_TIME);
};

//TODO: startNewPeriod

export { currentPeriod };
