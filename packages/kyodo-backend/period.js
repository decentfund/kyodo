const { Period, Colony, getColonyById } = require('./db.js');
const { dbGetAllUsers, getAllUsers, findUserByAddress } = require('./user.js');
const { PERIOD_TIME } = require('./constants/periodTime.js');

let getBalance = () => 0;
if (process.env.NODE_ENV !== 'test') {
  const { getBalance: tokenGetBalance } = require('./token');
  getBalance = tokenGetBalance;
}

let currentPeriod = 0;
console.log('PERIOD', currentPeriod);

const initPeriod = async (blockNumber, periodId, colonyId) => {
  const colony = await getColonyById(colonyId);
  const users = await dbGetAllUsers();
  currentPeriod = periodId;
  colony.periodIds.push(currentPeriod);
  await colony.save(err => {
    if (err) return console.error(err);
  });

  users.map(async el => {
    const balance = await getBalance(el.address, blockNumber);
    let period = new Period({
      // TODO: Period title
      title: 'My new period',
      address: el.address,
      periodId: currentPeriod,
      // TODO: Fetch user balance
      balance, //current user balance
      tips: 0,
    });
    await period.save(err => {
      if (err) return console.error(err);
    });
  });
};

const initiateNewPeriod = async (req, res) => {
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
    });
    await period.save((err, el) => {
      if (err) return console.error(err);
    });
  });
  res
    .status(200)
    .send(
      `Successfully initiated first period of a colony, let the games begin!!!`,
    );
};

const getAllPeriods = async (req, res) => {
  let periods = await Period.find((err, periods) => {
    if (err) return console.error(err);
    res.send(`ALL THE PERIODS: ${periods}`);
  });
  return periods;
};

const getCurrentPeriod = async (req, res) => {
  await Period.find({ periodId: currentPeriod });
  res.status(200).send(currentPeriod);
};

// exports.getUserPeriodBalance = async () => {};

const getUserByAddressInPeriod = async address => {
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

const changeUserBalance = async (address, tip) => {
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
const beginTheColonyCountdown = async (req, res) => {
  setTimeout(async () => {
    await initiateNewPeriod(req, res);
  }, PERIOD_TIME);
};

//TODO: startNewPeriod

module.exports = {
  currentPeriod,
  getAllPeriods,
  getCurrentPeriod,
  getUserByAddressInPeriod,
  initiateNewPeriod,
  changeUserBalance,
  beginTheColonyCountdown,
  initPeriod,
};
