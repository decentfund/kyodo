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

export const initPeriod = async (blockNumber, periodId, colonyId) => {
  const colony = await getColonyById(colonyId);
  const users = await dbGetAllUsers();
  currentPeriod = periodId;
  colony.periodIds.push(currentPeriod);
  await colony.save();

  users.map(async el => {
    const balance = await getBalance(el.address, blockNumber);
    await createAndSaveNewUserPeriod({
      address: el.address,
      periodId: currentPeriod,
      balance, //current user balance
      tips: 0,
    });
  });
};

export const createAndSaveNewUserPeriod = async ({
  address,
  periodId,
  balance,
  tips,
  user,
}) => {
  let period = new Period({
    // TODO: Period title
    title: 'My new period',
    address,
    periodId,
    balance, //current user balance
    user,
    tips,
  });
  await period.save();
  return period;
};

export const initiateNewPeriod = async (req, res) => {
  // verify all users are present in db
  // fetching users from smart contract

  let users = await getAllUsers(req, res);
  currentPeriod++;
  users.map(async el => {
    console.log('USER INSIDE LOOP', el);
    let period = new Period({
      title: req.body.title,
      address: el.address,
      periodId: currentPeriod,
      balance: el.balance, //current user balance
      tips: 0,
      user: el,
    });
    await period.save();
  });
  res
    .status(200)
    .send(
      `Successfully initiated first period of a colony, let the games begin!!!`,
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

export const getCurrentPeriodTotalBalance = async (req, res) => {
  const period = await Period.aggregate([
    { $match: { periodId: currentPeriod } },
    { $group: { _id : null, balance: { $sum: "$balance" } } },
    { $project: { _id: 0, balance: 1 } }
  ]);
  res.status(200).send(period[0] || {});
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

export const changeUserBalance = async (address, tip) => {
  let sender = await Period.find({
    address: address,
  });
  await Period.update(
    { address: address },
    { $set: { balance: sender[0].balance - tip } },
    (err, res) => {
      if (err) console.log(err);
      return res;
    },
  );
};

//MEGA CRON
export const beginTheColonyCountdown = async (req, res) => {
  setTimeout(async () => {
    await initiateNewPeriod(req, res);
  }, PERIOD_TIME);
};

//TODO: startNewPeriod

export { currentPeriod };
