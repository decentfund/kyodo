const web3 = require('web3');
const { User, getColonyById, getCurrentUserPeriod } = require('./db.js');

const dbAddUser = async ({ address, alias, balance, domains, tasks }) => {
  const user = new User({
    address,
    alias,
    balance,
    domains,
    tasks,
    dateCreated: Date.now(),
  });

  user.save(err => {
    if (err) return null;
  });

  return user;
};

exports.dbAddUser = dbAddUser;

exports.addUser = async (req, res) => {
  const user = dbAddUser(req.body);

  if (user) {
    res.status(200).send({
      user,
      message: 'ALL GOOD! User saved successfully. Have a beer',
    });
  }
};

const dbGetAllUsers = async () => {
  return await User.find((err, users) => {
    if (err) {
      console.log(err);
      return [];
    }
    return users;
  });
};

exports.getAllUsers = async (req, res) => {
  let users = await dbGetAllUsers();
  res.status(200).send(users);
  return users;
};

exports.dbGetAllUsers = dbGetAllUsers;

exports.getUserByAddress = async (req, res) => {
  await User.find({ address: req.body.address });
};

exports.getUserByAlias = async (req, res) => {
  await User.find({ alias: req.body.alias });
};

const dbGetUserByAlias = async alias => {
  return await User.findOne({ alias });
};

exports.dbGetUserByAlias = dbGetUserByAlias;

exports.getUserBalance = async alias => {
  const colony = await getColonyById(0);
  const currentPeriodId = colony.periodIds[colony.periodIds.length - 1];
  const { balance } = await getCurrentUserPeriod(alias, currentPeriodId);
  return balance;
};

exports.setUserAlias = async ({ user, alias, blockNumber }) => {
  user.alias = alias;
  user.aliasSet = blockNumber;

  user.save(err => {
    if (err) return null;
  });

  return user;
};

exports.addDomainToUser = async (req, res) => {
  // TODO:
};

exports.addTaskToUser = async (req, res) => {
  // TODO:
};

exports.changeUserAlias = async (req, res) => {
  // TODO:
  // this.getUserByAlias(req.body.alias);
};

const updateUserAddress = async ({ alias, address }) => {
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

exports.updateUserAddress = updateUserAddress;
