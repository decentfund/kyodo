const mongoose = require('mongoose');

const db = mongoose.connect('mongodb://localhost/colony');

const taskSchema = new mongoose.Schema({
  taskId: String,
  taskTitle: String,
  specificationHash: String,
  finalized: Boolean,
  cancelled: Boolean,
  dateCreated: Date,
  dueDate: Date,
  potId: Number,
  domainId: Number,
  // id: Number,
  // skillId: Number
});

const colonySchema = new mongoose.Schema({
  colonyName: String,
  colonyId: String,
  colonyAddress: String,
  tokenAddress: String,
  tokenName: String,
  tokenSymbol: String,
  creationBlockNumber: Number,
  creationDate: Date,
  periodIds: Array,
});

const domainSchema = new mongoose.Schema({
  domainId: Number,
  domainTitle: String,
  localSkillId: Number,
  potId: Number,
});

const tipSchema = new mongoose.Schema({
  from: String,
  to: String,
  amount: Number,
  taskId: Number,
  domainId: Number,
  potId: Number,
  dateCreated: Date,
  periodId: Number,
});

const userSchema = new mongoose.Schema({
  address: String,
  nickname: String,
  balance: Number,
  domains: Array,
  tasks: Array,
  dateCreated: Date,
});

const periodSchema = new mongoose.Schema({
  title: String,
  address: String,
  periodId: Number,
  balance: Number,
});

const Task = mongoose.model('Task', taskSchema);
const Colony = mongoose.model('Colony', colonySchema);
const Domain = mongoose.model('Domain', domainSchema);
const Tip = mongoose.model('Tip', tipSchema);
const User = mongoose.model('User', userSchema);
const Period = mongoose.model('Period', periodSchema);

const getColonyById = async colonyId => {
  return await Colony.findOne({ colonyId });
};

const getCurrentUserPeriod = async (alias, periodId) => {
  const { address } = await User.findOne({ alias });
  return await Period.findOne({ address, periodId });
};

module.exports = {
  Task,
  Colony,
  Domain,
  Tip,
  User,
  Period,
  getColonyById,
  getCurrentUserPeriod,
};
