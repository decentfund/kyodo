const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const periodSchema = new Schema({
  title: String,
  address: String,
  periodId: Number,
  balance: Number,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

const Period = mongoose.model('Period', periodSchema);
module.exports = Period;
