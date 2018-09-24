const { User } = require('./db.js');

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
