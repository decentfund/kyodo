const { Tip } = require("./db.js");

exports.sendTip = async (req, res) => {
  // TODO: colonyClient integration
  // transfer.send({ destinationAddress, amount }, options)
  // transferFrom.send({ sourceAddress, destinationAddress, amount }, options)

  let tip = new Tip({
    from: req.body.from,
    to: req.body.to,
    amount: req.body.amount,
    taskId: req.body.taskId,
    domainId: req.body.domainId,
    dateCreated: new Date.now(),
    periodId: req.body.periodId
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
