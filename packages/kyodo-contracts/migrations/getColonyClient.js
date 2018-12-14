const path = require('path');
const fs = require('fs');
const { providers, Wallet } = require('ethers');
const { default: EthersAdapter } = require('@colony/colony-js-adapter-ethers');
const {
  default: NetworkLoader,
} = require('@colony/colony-js-contract-loader-network');

// Import the ColonyNetworkClient
const { default: ColonyNetworkClient } = require('@colony/colony-js-client');

const { TruffleLoader } = require('@colony/colony-js-contract-loader-fs');

const appDirectory = fs.realpathSync(process.cwd());
const contractDir = path.resolve(appDirectory, '../build/contracts');

const getPrivateKey = (network, accounts) => {
  // import keys from ganache if development
  // else try to get keys from wallet created from env mnemonic var
  // TODO: Wrap and throw error on empty file / var
  if (network === 'development') {
    const keys = require('../ganache-accounts.json');
    const rawKey = keys.private_keys[accounts[0].toLowerCase()];
    return rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`;
  } else {
    const mnemonic = process.env.MNEMONIC;
    return Wallet.fromMnemonic(mnemonic).privateKey;
  }
};

const getProvider = network => {
  if (network === 'development') {
    // Create a provider for local TestRPC (Ganache)
    return new providers.JsonRpcProvider('http://localhost:8545/');
  } else {
    return providers.getDefaultProvider(network);
  }
};

const getLoader = network => {
  if (network !== 'rinkeby') {
    return new TruffleLoader({
      contractDir,
    });
  } else {
    return new NetworkLoader({ network });
  }
};

module.exports = (network, accounts) => {
  // get key
  const key = getPrivateKey(network, accounts);

  // get provider
  const provider = getProvider(network);

  // setting wallet
  const wallet = new Wallet(key, provider);

  // getting loader
  const loader = getLoader(network);

  // Create an adapter (powered by ethers)
  const adapter = new EthersAdapter({
    loader,
    provider,
    wallet,
  });

  // Connect to ColonyNetwork with the adapter!
  const networkClient = new ColonyNetworkClient({ adapter });
  return networkClient;
};
