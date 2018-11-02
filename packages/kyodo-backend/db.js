import mongoose, { Schema } from 'mongoose';
import { SystemError } from './errors';

import Period from './models/Period';
import User from './models/User';
import Tip from './models/Tip';
import Point from './models/Point';

mongoose.connection.on('error', e => {
  if (e.message.code === 'ETIMEDOUT') {
    console.log(e);
  }
  console.log(e);
});

mongoose.connection.once('open', () => {
  console.log(`MongoDB successfully connected to mongoUri`);
});

export const initDb = () => mongoose.connect('mongodb://localhost/colony');

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

export const colonySchema = new mongoose.Schema({
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

export const domainSchema = new Schema({
  domainId: Number,
  domainTitle: String,
  localSkillId: Number,
  potId: Number,
});

export const Task = mongoose.model('Task', taskSchema);
export const Colony = mongoose.model('Colony', colonySchema);
export const Domain = mongoose.model('Domain', domainSchema);

export const getColonyById = async colonyId => {
  return await Colony.findOne({ colonyId });
};

export const getCurrentUserPeriod = async (alias, periodId) => {
  const user = await User.findOne({ alias });
  const period = await Period.findOne({ user: user._id, periodId });
  const sentTips = await Tip.find({ from: user, periodId });
  const usedPoints = sentTips.reduce((sum, v) => sum + v.amount, 0);
  const receivedPoints = (await Point.find({
    owner: user,
    used: false,
  })).reduce((sum, v) => sum + v.amount, 0);
  const delegatedPoints = (await Point.find({ delegatee: user })).reduce(
    (sum, v) => sum + v.amount,
    0,
  );

  if (!period) throw new SystemError('Cannot find user current period');

  return {
    ...period,
    initialBalance: period.balance,
    balance: period.balance + receivedPoints - delegatedPoints - usedPoints,
  };
};

export const getDomainByCode = async code => {
  const domain = await Domain.findOne({ domainTitle: code });
  if (!domain) throw Error('Domain not found');

  return domain;
};

export { Tip, Point, Period, User };
