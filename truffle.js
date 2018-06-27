require('babel-register')({
  ignore: /node_modules\/(?!openzeppelin-solidity\/test\/helpers)/,
});
require('babel-polyfill');

module.exports = {
  migrations_directory: './migrations',
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 500,
    },
  },
};
