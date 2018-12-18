import Web3 from 'web3';
const provider = new Web3.providers.WebsocketProvider(
  process.env.WS_PROVIDER || 'ws://localhost:8545',
);
import TruffleContract from 'truffle-contract';
import Periods from '@kyodo/contracts/build/contracts/PeriodsV1.json';
import { getKyodo } from './kyodo';

let periods;

export const getPeriods = async () => {
  if (periods) return periods;

  const kyodo = await getKyodo();
  const periodsAddress = await kyodo.periods();
  const contract = TruffleContract(Periods);
  await contract.setProvider(provider);
  periods = await contract.at(periodsAddress);
  return periods;
};

export const getStartTime = async () => {
  const periods = await getPeriods();
  const currentPeriodStartTime = (await periods.currentPeriodStartTime()).toNumber();
  return currentPeriodStartTime;
};

export const getPeriodDaysLength = async () => {
  const periods = await getPeriods();
  const periodDaysLength = (await periods.periodDaysLength()).toNumber();
  return periodDaysLength;
};
