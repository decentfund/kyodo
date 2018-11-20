import Tip from '../../models/Tip';

export const addTip = async ({ domain, receiver, sender, amount }) => {
  console.log('adding tips');
  console.log(sender);
  console.log(receiver);
  let tip = new Tip({
    from: sender,
    to: receiver,
    amount,
    domain,
    periodId: 0,
  });

  await tip.save();

  return tip;

  // // const user = await addUser({ alias: alias || generateRandomString });

  // // Increasing user balance
  // await User.update({ _id: user._id }, { balance: 10, address: '0x0' });

  // const aw = await Period.find();

  // const currentUserPeriod = await Period.findOne({
  // user: user._id,
  // periodId: 0,
  // });

  // await Period.update({ _id: currentUserPeriod._id }, { balance: 10 });

  // return user;
};
