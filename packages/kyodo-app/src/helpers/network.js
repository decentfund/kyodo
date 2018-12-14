const { providers } = require('ethers');
const {
  default: NetworkLoader,
} = require('@colony/colony-js-contract-loader-network');
const { TrufflepigLoader } = require('@colony/colony-js-contract-loader-http');
const { default: EthersAdapter } = require('@colony/colony-js-adapter-ethers');

// Import the ColonyNetworkClient
const { default: ColonyNetworkClient } = require('@colony/colony-js-client');

export const getNetworkName = network => {
  switch (network) {
    case 1:
      return 'mainnet';
    case 2:
      return 'morden';
    case 3:
      return 'ropsten';
    case 4:
      return 'rinkeby';
    case 42:
      return 'kovan';
    case 5777:
      return 'private';
    default:
      return 'development';
  }
};

const getLoader = network => {
  if (network !== 'development') {
    return new NetworkLoader({ network });
  } else {
    return new TrufflepigLoader();
  }
};

export const getColonyNetworkClient = async (networkId, currentProvider) => {
  // Get network name
  const networkName = getNetworkName(networkId);

  // Create provider for wallet and ethers adapter
  const provider = await new providers.Web3Provider(
    currentProvider,
    // networkName, // FIXME: We migth need to pass network name
  );

  // Get wallet
  const wallet = provider.getSigner();

  // getting loader
  const loader = getLoader(networkName);

  // Create an adapter (powered by ethers)
  const adapter = new EthersAdapter({
    loader,
    provider,
    wallet,
  });

  // Connect to ColonyNetwork with the adapter!
  const networkClient = new ColonyNetworkClient({ adapter });
  await networkClient.init();
  return networkClient;
};
