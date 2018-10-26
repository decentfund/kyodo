const mongoose = require('mongoose');
const { SystemError } = require('./errors');

const Schema = mongoose.Schema;

const Period = require('./models/Period');
const User = require('./models/User');
const Tip = require('./models/Tip');

mongoose.connection.on('error', e => {
  if (e.message.code === 'ETIMEDOUT') {
    console.log(e);
  }
  console.log(e);
});

mongoose.connection.once('open', () => {
  console.log(`MongoDB successfully connected to mongoUri`);
});

const initDb = () => mongoose.connect('mongodb://localhost/colony');

const taskSchema = new mongoose.Schema({
  taskId: String,
  taskTitle: String,
  specificationHash: String,
  finalized: Boolean,
  cancelled: Boolean,
  dateCreated: Date,
  dueDate: Date,
  potId: Number,
  // domainId: Number,
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

colonySchema.virtual('currentPeriodId').get(function() {
  return this.periodIds[this.periodIds.length - 1];
});

const domainSchema = new Schema({
  domainId: Number,
  domainTitle: String,
  localSkillId: Number,
  potId: Number,
});

const Task = mongoose.model('Task', taskSchema);
const Colony = mongoose.model('Colony', colonySchema);
const Domain = mongoose.model('Domain', domainSchema);

const getColonyById = async colonyId => {
  return await Colony.findOne({ colonyId });
};

const getCurrentUserPeriod = async (alias, periodId) => {
  const user = await User.findOne({ alias });
  const period = await Period.findOne({ user: user._id, periodId });
  const sentTips = await Tip.find({ from: user, periodId });
  const usedPoints = sentTips.reduce((sum, v) => sum + v.amount, 0);

  if (!period) throw new SystemError('Cannot find user current period');

  return {
    ...period,
    initialBalance: period.balance,
    balance: period.balance - usedPoints,
  };
};

const getDomainByCode = async code => {
  const domain = await Domain.findOne({ domainTitle: code });
  if (!domain) throw Error('Domain not found');

  return domain;
};

module.exports = {
  initDb,
  Task,
  Colony,
  Domain,
  Tip,
  User,
  Period,
  getColonyById,
  getCurrentUserPeriod,
  getDomainByCode,
};
