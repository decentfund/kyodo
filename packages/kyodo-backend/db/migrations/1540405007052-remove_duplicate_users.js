const groupBy = require('lodash/fp/groupBy');
const sortBy = require('lodash/fp/sortBy');
const filter = require('lodash/fp/filter');
const flow = require('lodash/fp/flow');
const pick = require('lodash/pick');
const mongoose = require('mongoose');
if (mongoose.connection.readyState != mongoose.STATE_OPEN) {
  mongoose.connect('mongodb://localhost/colony');
}
const User = require('../../models/User');
const Tip = require('../../models/Tip');

export async function up() {
  // Fetch and parse unique names
  const users = await User.find();
  const groupedByAlias = flow([
    filter(x => x.alias),
    sortBy(x => x['dateCreated']),
    groupBy(x => x['alias']),
  ])(users);

  const dupeUsersAliases = Object.keys(groupedByAlias).filter(
    u => groupedByAlias[u].length > 1,
  );

  const dupeUsers = pick(groupedByAlias, dupeUsersAliases);

  for (const users of Object.values(dupeUsers)) {
    // Getting oldest user to reassign tips to this user
    const oldestUser = users.shift();

    // Iterating over users
    for (const user of users) {
      // Getting user id
      const userId = user._id;

      // Finding and changing tips receiver to and from to oldest user
      await Tip.updateMany({ to: userId }, { $set: { to: oldestUser._id } });
      await Tip.updateMany(
        { from: userId },
        { $set: { from: oldestUser._id } },
      );
    }

    // Removing duplicate users
    await User.remove({ _id: { $in: users.map(u => u._id) } });
  }
}

export async function down() {}
