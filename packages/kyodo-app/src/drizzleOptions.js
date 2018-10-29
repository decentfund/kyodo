// TODO: For production we need to export interfaces in kyodo-contracts folder and work with abi and deployed addresses
import Registry from '@kyodo/contracts/build/contracts/Registry.json';
import Token from '@kyodo/contracts/build/contracts/Token.json';

const drizzleOptions = {
  web3: {
    ignoreMetamask: true,
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545',
      // url: 'ws://ropsten.infura.io/ws',
      // url: 'ws://rinkeby.infura.io/ws',
      // change URL and Metamask server
    },
  },
  contracts: [Registry, Token],
  events: {
    Registry: [
      {
        eventName: 'VersionAdded',
        eventOptions: {
          fromBlock: 0,
        },
      },
    ],
  },
  polls: {
    accounts: 1500,
  },
};

export default drizzleOptions;
