const path = require('path');
const fs = require('fs');
var DecentToken = artifacts.require('./DecentToken.sol');
var KyodoDAO = artifacts.require('./KyodoDAO.sol');
const { providers, Wallet } = require('ethers');
const { default: EthersAdapter } = require('@colony/colony-js-adapter-ethers');

// Import the ColonyNetworkClient
const { default: ColonyNetworkClient } = require('@colony/colony-js-client');

const { TruffleLoader } = require('@colony/colony-js-contract-loader-fs');

const appDirectory = fs.realpathSync(process.cwd());
const contractDir = path.resolve(appDirectory, '../build/contracts');

const loader = new TruffleLoader({
  contractDir,
});

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    let wallet;
    let provider;
    if (network === 'development') {
      // import keys
      const keys = require('../ganache-accounts.json');
      const rawKey = keys.private_keys[accounts[0]];
      const key = rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`;

      // Create a provider for local TestRPC (Ganache)
      provider = new providers.JsonRpcProvider('http://localhost:8545/');

      // Create a wallet with the private key (so we have a balance we can use)
      wallet = new Wallet(key, provider);
    } else if (network === 'ropsten') {
      const mnemonic = process.env.MNEMONIC;

      // Create a provider for INFURA
      provider = new providers.InfuraProvider(providers.network.ropsten);
      wallet = Wallet.fromMnemonic(mnemonic);
    } else {
      // TODO: Mainnet
      return;
    }

    // Create an adapter (powered by ethers)
    const adapter = new EthersAdapter({
      loader,
      provider,
      wallet,
    });

    // Connect to ColonyNetwork with the adapter!
    const networkClient = new ColonyNetworkClient({ adapter });
    await networkClient.init();

    // Get decentToken address
    const tokenAddress = DecentToken.address;

    // Create new colony
    const data = await networkClient.createColony.send({
      tokenAddress,
    });

    const {
      eventData: { colonyAddress },
    } = data;

    // Setting KyodoDAO Colony address
    await KyodoDAO.at(KyodoDAO.address).setColonyAddress(colonyAddress);
  });
};
