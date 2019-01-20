require('babel-register');
require('babel-polyfill');
require('dotenv').load();

const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  migrations_directory: './migrations',
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          `https://ropsten.infura.io/${
            process.env.REACT_APP_INFURA_ACCESS_TOKEN
          }`,
        ),
      network_id: 3, // match any network
      gas: 2000000,
      gasPrice: 3000000000,
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          `https://rinkeby.infura.io/${
            process.env.REACT_APP_INFURA_ACCESS_TOKEN
          }`,
        ),
      network_id: 4, // match any network
      gas: 2000000,
      gasPrice: 3000000000,
    },
  },
  compilers: {
    solc: {
      version: '0.4.24',
      docker: true,
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: 'byzantium',
      },
    },
  },
};
