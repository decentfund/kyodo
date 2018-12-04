import map from 'lodash/map';
import sum from 'lodash/sum';
import { Tip, Domain, getDomainByCode, Colony, getColonyById } from './db.js';
import { getUserBalance, dbGetUserByAlias, getOrCreateUser } from './user';
import { dbCreateTask as createTask, getTaskByTitle } from './task';

export const sendNewTip = async ({
  sender,
  amount = 0,
  domain: code,
  title,
  receiver,
} = {}) => {
  try {
    const colony = await Colony.findOne();
    const currentPeriodId = colony.periodIds[colony.periodIds.length - 1];

    // Verify sender is specified
    if (!sender) throw Error('No sender specified');

    // Throw error if amount is not specified
    if (amount <= 0) throw new Error('No money no honey, sorry');

    // Throw error if sender is not present
    const senderUser = await dbGetUserByAlias(sender);

    // Get receiver if not present create a new one
    const receiverUser = await getOrCreateUser({ alias: receiver });

    const balance = await getUserBalance(sender);
    if (!checkBalance(balance, amount))
      throw Error(
        "You have 0 points. But don't worry! You can earn them by making contributions other people find useful. Or just by making me laugh.",
      );

    // Getting domain
    // TODO: Throw error if domain is not found
    const domain = await getDomainByCode(code);

    // TODO: Try to find task
    // FIXME: Find task in period
    // If not available create a new one
    let task = await getTaskByTitle(title);
    if (!task) {
      task = await createTask({ title });
    }

    let tip = new Tip({
      from: senderUser,
      to: receiverUser,
      amount,
      task,
      domain,
      // potId: req.body.potId,
      dateCreated: Date.now(),
      // FIXME: Get period from colony
      periodId: currentPeriodId,
    });

    await tip.save();
    return tip;
  } catch (e) {
    if (e.name === 'SystemError') {
      throw new Error(
        'Uh-oh! Something went wrong! Please contact admin from the chat and submit a ticket with details in the repo http://github.com/decentfund/kyodo',
      );
    }
    if (e.message === 'Not found') {
      if (sender === e.value) {
        throw Error('Sender is not registered');
      }
    }
    throw e;
  }
};

export const getColonyCurrentPeriodId = async () => {
  const colony = await getColonyById(0);
  const currentPeriodId = colony.periodIds[colony.periodIds.length - 1];
  return currentPeriodId;
};

export const getAllTips = async () => {
  const currentPeriodId = await getColonyCurrentPeriodId();
  let tips = await Tip.find({ periodId: currentPeriodId })
    .populate('task', 'taskTitle')
    .populate('domain', 'domainTitle')
    .populate('from')
    .populate('to');
  return tips;
};

export const getUserTips = async ({ user, periodId, direction }) => {
  const tips = await Tip.find(
    { periodId: periodId, [direction]: user._id },
    err => {
      if (err) return console.error(err);
    },
  )
    .populate('task', 'taskTitle')
    .populate('domain', 'domainTitle')
    .populate('from')
    .populate('to');

  return tips;
};

export const getAllUserTips = async ({ user, periodId = null }) => {
  const _periodId = periodId || (await getColonyCurrentPeriodId());
  const fromTips = await getUserTips({
    user,
    periodId: _periodId,
    direction: 'from',
  });
  const toTips = await getUserTips({
    user,
    periodId: _periodId,
    direction: 'to',
  });
  return [...fromTips, ...toTips];
};

export const getAllTipsInDomain = async domain => {
  const govDomain = await Domain.find({ domainTitle: domain });
  const tips = await Tip.find({ domain: govDomain });
  return {
    total: sum(map(tips, 'amount')),
    tips,
  };
};

export const checkBalance = (balance, amount) => {
  if (amount <= balance && amount > 0) return true;
  return false;
};
