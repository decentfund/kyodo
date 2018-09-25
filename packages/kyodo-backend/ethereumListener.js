const Web3 = require('web3');
const { Colony, User } = require('./db.js');
// const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
const provider = new Web3.providers.WebsocketProvider('ws://localhost:8545');
const TruffleContract = require('truffle-contract');
const KyodoDAO = require('@kyodo/contracts/build/contracts/KyodoDAO.json');
const { createColony } = require('./colony.js');
const { dbAddUser, setUserAlias } = require('./user');
const { initPeriod } = require('./period');

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

const startListener = () => {
  initializeKyodo().then(async value => {
    kyodo = value;

    colonyAddress = await kyodo.Colony();
    let colony = await Colony.findOne({ colonyAddress });
    if (!colony) {
      colony = await createColony(colonyAddress);
    }

    kyodo.NewPeriodStart({ fromBlock: 0 }, async function(error, event) {
      const blockNumber = parseInt(event.blockNumber) - 1;
      const periodId = event.args._periodId.toNumber();
      const hasPeriod = colony.periodIds.includes(periodId);

      await updateUsers();
      if (!hasPeriod) {
        await initPeriod(blockNumber, periodId, colony.colonyId);
      }
    });

    kyodo.NewAliasSet({ fromBlock: 0 }, async function(error, event) {
      const address = event.args._address;
      const alias = event.args._alias;
      const blockNumber = event.blockNumber;

      const user = await User.findOne({ address });
      if (!user.aliasSet || user.aliasSet < event.blockNumber) {
        await setUserAlias({ user, alias, blockNumber });
      }
    });
  });
};

module.exports = startListener;
