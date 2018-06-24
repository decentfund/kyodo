const { User } = require("./db.js");

exports.addUser = async (req, res) => {
  //TODO: Colony network integration
  //getBalanceOf.call({ sourceAddress })

  const user = new User({
    address: req.body.address,
    alias: req.body.alias,
    tokenBalance: req.body.tokenBalance,
    domains: req.body.domains,
    tasks: req.body.tasks,
    dateCreated: Date.now()
  });

  user.save();
  res.status(200).send({
    user: user,
    message: "ALL GOOD! User saved successfully. Have a beer"
  });
};

exports.getAllUsers = async (req, res) => {
  let users = await User.find((err, users) => {
    if (err) return console.log(err);
  });
  res.status(200).send(users);
  return users;
};

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
