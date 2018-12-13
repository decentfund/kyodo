import Web3 from 'web3';
const provider = new Web3.providers.WebsocketProvider(
  process.env.WS_PROVIDER || 'ws://localhost:8545',
);
import TruffleContract from 'truffle-contract';
import Colony from '@kyodo/contracts/build/contracts/Colony.json';
import { getKyodo } from './kyodo';

let colony;

export const getColony = async () => {
  if (colony) return colony;

  const kyodo = await getKyodo();
  const colonyAddress = await kyodo.colony();
  const contract = await TruffleContract(Colony);
  await contract.setProvider(provider);
  colony = await contract.at(colonyAddress);
  return colony;
};
