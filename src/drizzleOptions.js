import KyodoDAO from './../build/contracts/KyodoDAO.json';
import DecentToken from './../build/contracts/DecentToken.json';

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545',
    },
  },
  contracts: [KyodoDAO, DecentToken],
  polls: {
    accounts: 1500,
  },
};

export default drizzleOptions;
