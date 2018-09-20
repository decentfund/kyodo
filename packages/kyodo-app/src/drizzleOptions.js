// TODO: For production we need to export interfaces in kyodo-contracts folder and work with abi and deployed addresses
import KyodoDAO from '@kyodo/contracts/build/contracts/KyodoDAO.json';
import DecentToken from '@kyodo/contracts/build/contracts/DecentToken.json';

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545',
      // url: 'ws://ropsten.infura.io/ws',
      // url: 'ws://rinkeby.infura.io/ws',
      // change URL and Metamask server
    },
  },
  contracts: [KyodoDAO, DecentToken],
  polls: {
    accounts: 1500,
  },
};

export default drizzleOptions;
