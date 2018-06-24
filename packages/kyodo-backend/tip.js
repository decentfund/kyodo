const { Tip } = require("./db.js");
const {
  changeUserBalance,
  currentPeriod,
  getUsebByAddressInPeriod
} = require("./period.js");

exports.sendTip = async (req, res) => {
  // TODO: colonyClient integration
  // transfer.send({ destinationAddress, amount }, options)
  // transferFrom.send({ sourceAddress, destinationAddress, amount }, options)

  let tipAmount = req.body.amount;
  let sender = getUsebByAddressInPeriod(req.body.from);
  let balance = sender.balance;

  if (!this.checkBalance(balance, tipAmount)) {
    res.status(400).res.send("Inssuficient funds for the tip");
  }

  changeUserBalance(sender, tipAmount);

  let tip = new Tip({
    from: sender,
    to: req.body.to,
    amount: tipAmount,
    taskId: req.body.taskId,
    domainId: req.body.domainId,
    potId: req.body.potId,
    dateCreated: Date.now(),
    periodId: currentPeriod
  });

  tip.save((err, tip) => {
    if (err) return console.error(err);
  });
  res.end(
    `{"success" : Added ${tip} and ${hash} Successfully, "status" : 200}`
  );
};

exports.getAllTips = async (req, res) => {
  let tips = await Tip.find((err, tips) => {
    if (err) return console.error(err);
    console.log(tips);
    res.send(`ALL AVAILABLE TASKS: ${tips}`);
  });
};

exports.checkBalance = (balance, amount) => {
  if (amount <= balance && amount > 0) return true;
  return false;
};
