import Web3 from 'web3';
import { Colony, User, Domain } from './db.js';
// const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
const provider = new Web3.providers.WebsocketProvider(
  process.env.WS_PROVIDER || 'ws://localhost:8545',
);
import TruffleContract from 'truffle-contract';
import Members from '@kyodo/contracts/build/contracts/MembersV1.json';
import Domains from '@kyodo/contracts/build/contracts/DomainsV1.json';
import Periods from '@kyodo/contracts/build/contracts/PeriodsV1.json';
import { createColony } from './colony.js';
import { dbAddUser, setUserAlias } from './user';
import { initPeriod } from './period';
import { dbAddDomain as addDomain } from './domain';
import { getKyodo } from './web3/kyodo';
import { getColony } from './web3/colony';

let members;
let domains;
let periods;

const updateUsers = async () => {
  const kyodo = await getKyodo();
  const membersAddress = await kyodo.members();

  const MembersContract = TruffleContract(Members);
  MembersContract.setProvider(provider);
  members = await MembersContract.at(membersAddress);

  const whitelistedAddresses = await members.getWhitelistedAddresses();
  const existingUsers = await User.find({
    address: { $in: whitelistedAddresses },
  });

  const existingAddresses = existingUsers.map(u => u.address);
  const nonExistingAddresses = whitelistedAddresses.filter(
    addr => existingAddresses.indexOf(addr) < 0,
  );
  nonExistingAddresses.forEach(addr => {
    dbAddUser({ address: addr });
  });
};

const getEventPrevBlock = event => parseInt(event.blockNumber) - 1;
const parseNewPeriodEvent = event => ({
  prevBlockNumber: getEventPrevBlock(event),
  periodId: event.args._periodId.toNumber(),
});

const parseNewAliasSetEvent = event => ({
  address: event.args._address,
  alias: event.args._alias,
  blockNumber: event.blockNumber,
});

const parseNewDomainAddedEvent = event => ({
  id: event.args._id.toNumber(),
  title: event.args._code,
});

const startListener = () => {
  getKyodo().then(async kyodo => {
    const colonyContract = await getColony();
    const colonyAddress = colonyContract.address;
    let colony = await Colony.findOne({ colonyAddress });
    if (!colony) {
      colony = await createColony(colonyAddress);
    }

    // Updating current users state
    await updateUsers();

    const periodsAddress = await kyodo.periods();
    const PeriodsContract = TruffleContract(Periods);
    PeriodsContract.setProvider(provider);
    periods = await PeriodsContract.at(periodsAddress);

    // Options to get past events
    const options = { fromBlock: 0, toBlock: 'latest' };

    // Getting past periods
    const pastNewPeriodsEvents = await periods.getPastEvents(
      'NewPeriodStart',
      options,
    );

    // Syncing past periods
    pastNewPeriodsEvents
      .map(parseNewPeriodEvent)
      .filter(({ periodId }) => !colony.periodIds.includes(periodId))
      .forEach(async ({ prevBlockNumber, periodId }) => {
        await initPeriod(prevBlockNumber, periodId, colony.colonyId);
      });

    // Subscribe to new period events
    periods.NewPeriodStart().on('data', async event => {
      const { prevBlockNumber, periodId } = parseNewPeriodEvent(event);
      await initPeriod(prevBlockNumber, periodId, colony.colonyId);
    });

    // Getting past alias changes
    const pastNewAliasSetEvents = await members.getPastEvents(
      'NewAliasSet',
      options,
    );

    // Filtering last aliases set
    const latestAliases = pastNewAliasSetEvents
      .map(parseNewAliasSetEvent)
      .reduce((a, { address, blockNumber, alias }) => {
        if (!a.address || a.address.blockNumber < blockNumber) {
          a[address] = {
            alias,
            blockNumber,
          };
        }
        return a;
      }, {});

    // Syncing past aliases changes
    Object.keys(latestAliases).forEach(async address => {
      const user = await User.findOne({ address });
      const latestAlias = latestAliases[address];
      if (!user.aliasSet || user.aliasSet < latestAlias.blockNumber) {
        await setUserAlias({ user, ...latestAlias });
      }
    });

    // Subscribe to new alias set events
    members.NewAliasSet().on('data', async event => {
      const { address, blockNumber, alias } = parseNewAliasSetEvent(event);
      const user = await User.findOne({ address });
      await setUserAlias({ user, alias, blockNumber });
    });

    const domainsAddress = await kyodo.domains();
    const DomainsContract = TruffleContract(Domains);
    DomainsContract.setProvider(provider);
    domains = await DomainsContract.at(domainsAddress);

    // Getting past domain added
    const pastNewDomainAddedEvents = await domains.getPastEvents(
      'NewDomainAdded',
      options,
    );

    // filter existing domains
    const dbDomains = await Domain.find();
    const existingDomainsIds = dbDomains.map(d => d.domainId);
    // Syncing past domain added
    pastNewDomainAddedEvents
      .map(parseNewDomainAddedEvent)
      .filter(e => !existingDomainsIds.includes(e.id))
      .forEach(async domain => {
        // add domain
        await addDomain(domain);
      });

    // Subscribe to new domains added events
  });
};

export default startListener;
