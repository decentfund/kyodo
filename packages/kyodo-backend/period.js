const { Period } = require("./db.js");
const { getAllUsers, findUserByAddress } = require("./user.js");
const { PERIOD_TIME } = require("./constants/periodTime.js");

let currentPeriod = 0;
console.log("PERIOD", currentPeriod);

const initiateNewPeriod = async (req, res) => {
  let users = await getAllUsers(req, res);
  currentPeriod++;
  users.map(async el => {
    console.log("USER INSIDE LOOP", el);
    let period = new Period({
      title: req.body.title,
      address: el.address,
      periodId: currentPeriod,
      balance: el.balance, //current user balance
      tips: 0
    });
    await period.save((err, el) => {
      if (err) return console.error(err);
    });
  });
  res
    .status(200)
    .send(
      `Successfully initiated first period of a colony, let the games begin!!!`
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
      address: address
    },
    (err, user) => {
      if (err) console.log(err);
      return user;
    }
  );
  return user;
};

const changeUserBalance = async (address, tip) => {
  let sender = await Period.find({
    address: address
  });
  await Period.update(
    { address: address },
    { $set: { balance: sender[0].balance - tip } },
    (err, res) => {
      if (err) console.log(err);
      return res;
    }
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
  beginTheColonyCountdown
};
