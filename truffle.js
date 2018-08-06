require('babel-register')({
  ignore: /node_modules\/(?!openzeppelin-solidity\/test\/helpers)/,
});
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
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 500,
    },
  },
};
