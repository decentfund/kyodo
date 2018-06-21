const { generateIpfsHash, getTaskSpecification } = require("./ipfs.js");
const { getColonyInstanceFromId } = require("./colony");
const { initiateNetwork } = require("./network.js");
const { Task } = require("./db.js");

const getTaskFromChain = async id => {
  const networkClient = await initiateNetwork();
  const colonyClient = await getColonyInstanceFromId(76);
  const task = await colonyClient.getTask.call({ taskId: id });
  console.log("TASK:     ", task);
  return task;
};

exports.createTask = async (req, res) => {
  let networkClient = await initiateNetwork();
  let colonyClient = await getColonyInstanceFromId(76);
  let hash = await generateIpfsHash(req.body);
  await colonyClient.createTask.send({ specificationHash: hash });

  let task = new Task({
    taskId: req.body.taskId,
    taskTitle: req.body.taskTitle,
    specificationHash: hash
  });

  task.save((err, task) => {
    if (err) return console.error(err);
  });
  await getTaskFromChain(2);
  res.end(
    `{"success" : Added ${task} and ${hash} Successfully, "status" : 200}`
  );
};

exports.modifyTask = (req, res) => {
  //TODO: find the task by id, modify fields, both on chain and in DB??
};

exports.getTasks = async (req, res) => {
  let tasks = await Task.find((err, tasks) => {
    if (err) return console.error(err);
    console.log(tasks);
    res.send(`ALL AVAILABLE TASKS: ${tasks}`);
  });
};
