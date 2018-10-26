const mongoose = require('mongoose');
if (mongoose.connection.readyState != mongoose.STATE_OPEN) {
  mongoose.connect('mongodb://localhost/colony');
}
const Period = require('../../models/Period');
const User = require('../../models/User');

export async function up() {
  await Period.find({ user: null })
    .cursor()
    .eachAsync(async period => {
      const user = await User.findOne({ address: period.address });
      period.user = user._id;
      await period.save();
    });
}

export async function down() {}
