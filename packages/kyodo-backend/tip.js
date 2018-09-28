const { Tip, getDomainByCode, Colony, getColonyById } = require('./db.js');
const {
  changeUserBalance,
  currentPeriod,
  getUserByAddressInPeriod,
} = require('./period');
const {
  getUserBalance,
  dbGetUserByAlias: getUserByAlias,
  dbAddUser: addUser,
} = require('./user');
const { dbCreateTask: createTask, getTaskByTitle } = require('./task');

exports.sendTip = async (req, res) => {
  // TODO: colonyClient integration
  // transfer.send({ destinationAddress, amount }, options)
  // transferFrom.send({ sourceAddress, destinationAddress, amount }, options)

  let tipAmount = req.body.amount;
  if (tipAmount <= 0) {
    res.status(400).send('Seriously?!');
    return 'No money no honey, sorry';
  }

  let sender = await getUserByAddressInPeriod(req.body.from);
  let receiver = await getUserByAddressInPeriod(req.body.to);
  let senderAddress = sender[0].address;
  let senderBalance = sender[0].balance;
  let receiverAddress = receiver[0].address;

  if (!checkBalance(senderBalance, tipAmount)) {
    res.status(400).send('Inssuficient funds for the tip');
    return 'No money no honey, sorry';
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
    periodId: currentPeriod,
  });

  tip.save((err, tip) => {
    if (err) return console.error(err);
  });
  res
    .status(200)
    .send(
      `User ${senderAddress} Successfully tipped user ${receiverAddress} with ${tipAmount} `,
    );
};

exports.sendNewTip = async ({
  sender,
  amount = 0,
  domain: code,
  title,
  receiver,
} = {}) => {
  const colony = await Colony.findOne();
  const currentPeriodId = colony.periodIds[colony.periodIds.length - 1];

  // Verify sender is present and has enough points
  if (!sender) throw Error('No sender specified');
  if (amount <= 0) {
    // TODO: Raise error
    throw new Error('No money no honey, sorry');
  }

  // Throw error if sender is not present
  const senderUser = await getUserByAlias(sender);
  if (!senderUser) throw Error('Sender is not registered');
  const senderBalance = await getUserBalance(sender);

  // Get receiver if not present create a new one
  let receiverUser = await getUserByAlias(receiver);
  if (!receiverUser) {
    receiverUser = await addUser({ alias: receiver });
  }

  if (!checkBalance(senderBalance, amount))
    throw Error('No money no honey, sorry');

  // await changeUserBalance(senderAddress, tipAmount);
  // await changeUserBalance(receiverAddress, -tipAmount);
  //

  // Getting domain
  // TODO: Throw error if domain is not found
  const domain = await getDomainByCode(code);

  // TODO: Try to find task
  // FIXME: Find task in period
  // If not available create a new one
  let task = await getTaskByTitle(title);
  if (!task) {
    task = await createTask({ title });
  }

  let tip = new Tip({
    from: senderUser,
    to: receiverUser,
    amount,
    task,
    domain,
    // potId: req.body.potId,
    dateCreated: Date.now(),
    // FIXME: Get period from colony
    periodId: currentPeriodId,
  });

  await tip.save();
  return tip;
};

exports.getAllTips = async (req, res) => {
  const colony = await getColonyById(0);
  const currentPeriodId = colony.periodIds[colony.periodIds.length - 1];
  let tips = await Tip.find({ periodId: currentPeriodId }, (err, tips) => {
    if (err) return console.error(err);
  })
    .populate('task', 'taskTitle')
    .populate('domain', 'domainTitle')
    .populate('from')
    .populate('to');
  res.send(tips);
  return tips;
};

const checkBalance = (balance, amount) => {
  if (amount <= balance && amount > 0) return true;
  return false;
};

exports.checkBalance = checkBalance;
