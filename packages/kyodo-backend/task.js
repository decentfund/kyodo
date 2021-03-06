import { Task } from './db.js';
import RoleAssignment from './models/RoleAssignment';

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

export const getTaskById = async (req, res) => {
  await Task.find({ id: req.body.address });
};

export const getTaskByTitle = async title => {
  return await Task.findOne({ taskTitle: title });
};

export const modifyTask = (req, res) => {
  //TODO: find the task by id, modify fields, both on chain and in DB??
};

export const storeAssignmentOperation = async params => {
  return await RoleAssignment.create(params);
};

export const getAssignmentOperation = async params => {
  return await RoleAssignment.get(params);
};

export const acceptAssignmentOperation = async params => {
  return await RoleAssignment.accept(params);
};

export const getTasks = async (req, res) => {
  let tasks = await Task.find((err, tasks) => {
    if (err) return console.error(err);
    console.log(tasks);
    res.send(`ALL AVAILABLE TASKS: ${tasks}`);
  });
};
