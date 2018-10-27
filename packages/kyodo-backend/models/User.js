const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  address: String,
  alias: String,
  aliasSet: Number,
  balance: Number,
  domains: Array,
  tasks: Array,
  dateCreated: Date,
});

const User = mongoose.model('User', userSchema);
module.exports = User;
