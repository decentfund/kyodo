const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pointSchema = new Schema({
  amount: Number,
  used: Boolean,
  delegatee: { type: Schema.Types.ObjectId, ref: 'User' },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
});

const Point = mongoose.model('Point', pointSchema);
module.exports = Point;
