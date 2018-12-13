import { addUser } from '../../user';
import User from '../../models/User';
import Period from '../../models/Period';

export const generateRandomString = () =>
  Math.random()
    .toString(36)
    .substring(7);

export const addUserWithBalance = async alias => {
  const user = await addUser({ alias: alias || generateRandomString() });

  // Increasing user balance
  await User.updateOne(
    { _id: user._id },
    { initialBalance: 10, address: '0x0' },
  );

  const currentUserPeriod = await Period.findOne({
    user: user._id,
    periodId: 0,
  });

  await Period.update({ _id: currentUserPeriod._id }, { initialBalance: 10 });

  const updatedUser = await User.findOne({ _id: user._id });

  return updatedUser;
};
