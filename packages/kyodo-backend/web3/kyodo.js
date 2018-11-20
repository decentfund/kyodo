import Web3 from 'web3';
import TruffleContract from 'truffle-contract';
import Registry from '@kyodo/contracts/build/contracts/Registry.json';
import KyodoDAO from '@kyodo/contracts/build/contracts/KyodoDAO.json';

const provider = new Web3.providers.WebsocketProvider(
  process.env.WS_PROVIDER || 'ws://localhost:8545',
);

let registry;
let kyodo;

const getNewestVersionAddress = events =>
  events.sort(
    (a, b) =>
      parseFloat(b.returnValues.version) - parseFloat(a.returnValue.version),
  )[0];

const initializeKyodo = async () => {
  registry = TruffleContract(Registry);
  registry.setProvider(provider);
  const registryInstance = await registry.deployed();
  const pastEvents = await registryInstance.getPastEvents('VersionAdded', {
    fromBlock: 0,
    toBlock: 'latest',
  });
  const newestVersionAddress = getNewestVersionAddress(pastEvents).returnValues
    .implementation;

  const KyodoContract = TruffleContract(KyodoDAO);
  KyodoContract.setProvider(provider);
  kyodo = await KyodoContract.at(newestVersionAddress);
  return kyodo;
};

export const getKyodo = async () => {
  if (kyodo) return kyodo;

  return await initializeKyodo();
};
