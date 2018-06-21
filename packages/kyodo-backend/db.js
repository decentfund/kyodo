const mongoose = require("mongoose");

const db = mongoose.connect("mongodb://localhost/colony");

const taskSchema = new mongoose.Schema({
  taskId: String,
  taskTitle: String,
  specificationHash: String,
  finalized: Boolean,
  cancelled: Boolean,
  dueDate: Date,
  potId: Number,
  domainId: Number,
  id: Number,
  skillId: Number
});

const colonySchema = new mongoose.Schema({
  colonyId: String,
  colonyAddress: String,
  tokenAddress: String,
  tokenName: String,
  tokenSymbol: String
});

const Task = mongoose.model("Task", taskSchema);

const Colony = mongoose.model("Colony", colonySchema);

module.exports = { Task, Colony };
