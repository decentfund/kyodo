const mongoose = require("mongoose");

const db = mongoose.connect("mongodb://localhost/colony");

const taskSchema = new mongoose.Schema({
  taskId: String,
  taskTitle: String,
  specificationHash: String,
  finalized: Boolean,
  cancelled: Boolean,
  dateCreated: Date,
  dueDate: Date,
  potId: Number,
  domainId: Number
  // id: Number,
  // skillId: Number
});

const colonySchema = new mongoose.Schema({
  colonyId: String,
  colonyAddress: String,
  tokenAddress: String,
  tokenName: String,
  tokenSymbol: String
});

const domainSchema = new mongoose.Schema({
  domainId: Number,
  domainTitle: String,
  localSkillId: Number,
  potId: Number
});

const tipSchema = new mongoose.Schema({
  from: String,
  to: String,
  amount: Number,
  taskId: Number,
  domainId: Number,
  dateCreated: Date,
  periodId: Number
});

const userSchema = new mongoose.Schema({
  address: String,
  nickname: String,
  tokenBalance: Number,
  domains: Array,
  tasks: Array,
  dateCreated: Date
});

const periodSchema = new mongoose.Schema({
  address: String,
  periodId: Number,
  tipBalance: Number
});

const Task = mongoose.model("Task", taskSchema);
const Colony = mongoose.model("Colony", colonySchema);
const Domain = mongoose.model("Domain", domainSchema);
const Tip = mongoose.model("Tip", tipSchema);
const User = mongoose.model("User", userSchema);
const Period = mongoose.model("Period", periodSchema);

module.exports = { Task, Colony, Domain, Tip, User, Period };
