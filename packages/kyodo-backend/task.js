import { generateIpfsHash, getTaskSpecification } from './ipfs.js';
import { getColonyInstanceFromId } from './colony';
import { initiateNetwork } from './network.js';
import { Task } from './db.js';

const getTaskFromChain = async id => {
  const networkClient = await initiateNetwork();
  const colonyClient = await getColonyInstanceFromId(76);
  const task = await colonyClient.getTask.call({ taskId: id });
  console.log('TASK:     ', task);
  return task;
};

export const dbCreateTask = async ({ title }) => {
  let task = await new Task({
    taskTitle: title,
    dateCreated: Date.now(),
  });

  await task.save(err => {
    if (err) return console.error(err);
  });

  return task;
};

export const createTask = async (req, res) => {
  let networkClient = await initiateNetwork();
  let colonyClient = await getColonyInstanceFromId(76);
  let hash = await generateIpfsHash(req.body);
  await colonyClient.createTask.send({ specificationHash: hash });
  let taskCount = await colonyClient.getTaskCount.call();
  let newTask = await getTaskFromChain(taskCount.count);

  let task = new Task({
    taskId: taskCount.count,
    taskTitle: req.body.taskTitle,
    specificationHash: hash,
    finalized: newTask.finalized,
    cancelled: newTask.cancelled,
    dateCreated: Date.now(),
    dueDate: new Date(req.body.dueDate),
    potId: newTask.potId,
    domainId: newTask.potId,
    // id: newTask.id,
    // skillId: newTask.skillId
  });

  task.save((err, task) => {
    if (err) return console.error(err);
  });
  // await getTaskFromChain();
  res.end(`{"success" : Added and ${hash} Successfully, "status" : 200}`);
};

export const getTaskById = async (req, res) => {
  await Task.find({ id: req.body.address });
};

export const getTaskByTitle = async title => {
  return await Task.findOne({ taskTitle: title });
};

export const modifyTask = (req, res) => {
  //TODO: find the task by id, modify fields, both on chain and in DB??
};

export const getTasks = async (req, res) => {
  let tasks = await Task.find((err, tasks) => {
    if (err) return console.error(err);
    console.log(tasks);
    res.send(`ALL AVAILABLE TASKS: ${tasks}`);
  });
};
