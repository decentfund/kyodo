import 'babel-polyfill';
import { sendNewTip } from './tip';
import pick from 'lodash/pick';
import map from 'lodash/map';
import { getAllUserTips, getAllTipsInDomain } from './tip';
import { Domain, Colony } from './db';
import { addUserWithBalance } from './test/helpers/user';
import {
  connectMongoose,
  clearDb,
  disconnectMongoose,
  createColony,
  createDomain,
} from './test/helpers';

beforeAll(connectMongoose);
beforeEach(clearDb);
afterAll(disconnectMongoose);

describe('get user tips', () => {
  let insUser, insUser2;

  beforeEach(async () => {
    await createColony();
    await createDomain();

    insUser = await addUserWithBalance('igor');
    insUser2 = await addUserWithBalance('alina');

    // const users = await User.find();

    await sendNewTip({
      sender: insUser.alias,
      receiver: 'someone',
      amount: 2,
      title: 'yes',
      domain: 'GOV',
    });

    await sendNewTip({
      sender: insUser2.alias,
      receiver: insUser.alias,
      amount: 3,
      title: 'hey!',
      domain: 'GOV',
    });
  });

  it('sets test properly', async () => {
    const domains = await Domain.find();
    expect(domains.length).toBe(1);

    const colonies = await Colony.find();
    expect(colonies.length).toBe(1);
  });

  it('returns all user tips', async () => {
    const userTips = await getAllUserTips({ user: insUser });
    expect(
      map(userTips, item =>
        pick(item, [
          'amount',
          'domain.domainTitle',
          'from.alias',
          'periodId',
          'task.taskTitle',
          'to.alias',
        ]),
      ),
    ).toMatchSnapshot();
  });

  it('returns all tips in domain', async () => {
    const { total, tips } = await getAllTipsInDomain('GOV');
    expect(total).toEqual(5);
    expect(
      map(tips, item => pick(item, ['amount', 'periodId'])),
    ).toMatchSnapshot();
  });
});
