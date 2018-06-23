const User = require("./db.js");

exports.addUser = async (req, res) => {
  //TODO: Colony network integration
  //getBalanceOf.call({ sourceAddress })

  const user = new User({
    address: req.body.address,
    nickname: req.body.nickname,
    tokenBalance: req.body.tokenBalance,
    domains: req.body.domains,
    tasks: req.body.tasks,
    dateCreated: new Date.now()
  });

  user.save();
  res.send(`ALL GOOD! User ${user} saved successfully. Have a beer`);
};

//TODO: getAllUsers ? ez

//TODO: findUserById or findUserByAddress ??? ORNOT

exports.findUserByAddress = async (req, res) => {
  await User.find({ address: req.body.address });
};
