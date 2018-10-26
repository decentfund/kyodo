const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tipSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: 'User' },
  to: { type: Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  task: { type: Schema.Types.ObjectId, ref: 'Task' },
  domain: { type: Schema.Types.ObjectId, ref: 'Domain' },
  potId: Number,
  dateCreated: Date,
  periodId: Number,
});

const Tip = mongoose.model('Tip', tipSchema);

module.exports = Tip;
