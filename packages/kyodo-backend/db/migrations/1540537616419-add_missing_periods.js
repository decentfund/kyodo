const mongoose = require('mongoose');
if (mongoose.connection.readyState != mongoose.STATE_OPEN) {
  mongoose.connect('mongodb://localhost/colony');
}
const User = require('../../models/User');
const Period = require('../../models/Period');

export async function up() {
  const users = await User.find();

  const periodsToInsert = [];
  for (var user of users) {
    const periodExists = await Period.findOne({ user: user._id, periodId: 0 });
    if (!periodExists) {
      const periodToInsert = {
        title: 'My new period',
        address: user.address,
        periodId: 0,
        balance: 0,
        user,
        tips: [],
      };
      periodsToInsert.push(periodToInsert);
    }
  }
  await Period.insertMany(periodsToInsert);
}

export async function down() {}
