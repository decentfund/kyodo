import Web3 from 'web3';
const provider = new Web3.providers.WebsocketProvider(
  process.env.WS_PROVIDER || 'ws://localhost:8545',
);
import TruffleContract from 'truffle-contract';
import Token from '@kyodo/contracts/build/contracts/Token.json';

let token;

const initializeToken = async () => {
  if (token) return token;
  const contract = await TruffleContract(Token);
  await contract.setProvider(provider);
  const instance = await contract.deployed();
  token = instance;
  return token;
};

export { initializeToken as getToken };

export const getBalance = async (address, blockNumber) => {
  if (!token) token = await initializeToken();
  const balance = await token.balanceOf(address, blockNumber);
  const decimals = await token.decimals();
  return balance / Math.pow(10, decimals);
};

initializeToken();
