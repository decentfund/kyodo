const { Tip } = require("./db.js");
const {
  changeUserBalance,
  currentPeriod,
  getUserByAddressInPeriod
} = require("./period.js");

exports.sendTip = async (req, res) => {
  // TODO: colonyClient integration
  // transfer.send({ destinationAddress, amount }, options)
  // transferFrom.send({ sourceAddress, destinationAddress, amount }, options)

  let tipAmount = req.body.amount;
  if (tipAmount <= 0) {
    res.status(400).send("Seriously?!");
    return "No money no honey, sorry";
  }

  let sender = await getUserByAddressInPeriod(req.body.from);
  let receiver = await getUserByAddressInPeriod(req.body.to);
  let senderAddress = sender[0].address;
  let senderBalance = sender[0].balance;
  let receiverAddress = receiver[0].address;

  if (!this.checkBalance(senderBalance, tipAmount)) {
    res.status(400).send("Inssuficient funds for the tip");
    return "No money no honey, sorry";
  }

  await changeUserBalance(senderAddress, tipAmount);
  await changeUserBalance(receiverAddress, -tipAmount);

  let tip = new Tip({
    from: senderAddress,
    to: receiverAddress,
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
  res
    .status(200)
    .send(
      `User ${senderAddress} Successfully tipped user ${receiverAddress} with ${tipAmount} `
    );
};

exports.getAllTips = async (req, res) => {
  let tips = await Tip.find((err, tips) => {
    if (err) return console.error(err);
    res.send(`ALL AVAILABLE TASKS: ${tips}`);
  });
  return tips;
};

exports.checkBalance = (balance, amount) => {
  if (amount <= balance && amount > 0) return true;
  return false;
};
