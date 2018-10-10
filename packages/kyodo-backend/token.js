const Web3 = require('web3');
const provider = new Web3.providers.WebsocketProvider(
  process.env.WS_PROVIDER || 'ws://localhost:8545',
);
const TruffleContract = require('truffle-contract');
const Token = require('@kyodo/contracts/build/contracts/Token.json');

let token;

const initializeToken = async () => {
  if (token) return token;
  const contract = await TruffleContract(Token);
  await contract.setProvider(provider);
  const instance = await contract.deployed();
  token = instance;
  return token;
};

const getBalance = async (address, blockNumber) => {
  if (!token) token = await initializeToken();
  const balance = await token.balanceOf(address, blockNumber);
  const decimals = await token.decimals();
  return balance / Math.pow(10, decimals);
};

initializeToken();

module.exports = {
  getToken: initializeToken,
  getBalance,
};
