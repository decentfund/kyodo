import mongoose, { Schema } from 'mongoose';

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
export default User;
