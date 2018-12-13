import mongoose, { Schema } from 'mongoose';

const periodSchema = new Schema({
  title: String,
  address: String,
  periodId: Number,
  balance: Number,
  initialBalance: Number,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

const Period = mongoose.model('Period', periodSchema);
export default Period;
