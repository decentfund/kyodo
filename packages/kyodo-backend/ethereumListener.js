const Web3 = require('web3');
const { Colony, User, Domain } = require('./db.js');
// const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
const provider = new Web3.providers.WebsocketProvider('ws://localhost:8545');
const TruffleContract = require('truffle-contract');
const KyodoDAO = require('@kyodo/contracts/build/contracts/KyodoDAO.json');
const { createColony } = require('./colony.js');
const { dbAddUser, setUserAlias } = require('./user');
const { initPeriod } = require('./period');
const { dbAddDomain: addDomain } = require('./domain');

let kyodo;
let colonyAddress;

const initializeKyodo = async () => {
  kyodo = TruffleContract(KyodoDAO);
  kyodo.setProvider(provider);
  const instance = await kyodo.deployed();
  return instance;
};

const updateUsers = async () => {
  const whitelistedAddresses = await kyodo.getWhitelistedAddresses();
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
  initializeKyodo().then(async value => {
    kyodo = value;

    colonyAddress = await kyodo.Colony();
    let colony = await Colony.findOne({ colonyAddress });
    if (!colony) {
      colony = await createColony(colonyAddress);
    }

    // Updating current users state
    await updateUsers();

    // Options to get past events
    const options = { fromBlock: 0, toBlock: 'latest' };

    // Getting past periods
    const pastNewPeriodsEvents = await kyodo.getPastEvents(
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
    kyodo.NewPeriodStart().on('data', async event => {
      const { prevBlockNumber, periodId } = parseNewPeriodEvent(event);
      await initPeriod(prevBlockNumber, periodId, colony.colonyId);
    });

    // Getting past alias changes
    const pastNewAliasSetEvents = await kyodo.getPastEvents(
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
    kyodo.NewAliasSet().on('data', async event => {
      const { address, blockNumber, alias } = parseNewAliasSetEvent(event);
      const user = await User.findOne({ address });
      await setUserAlias({ user, alias, blockNumber });
    });

    // Getting past domain added
    const pastNewDomainAddedEvents = await kyodo.getPastEvents(
      'NewDomainAdded',
      options,
    );

    // filter existing domains
    const domains = await Domain.find();
    const existingDomainsIds = domains.map(d => d.domainId);
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

module.exports = startListener;
