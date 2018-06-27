import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { drizzleReducers } from 'drizzle';
import get from 'lodash/get';
import rates, * as fromRates from './rates';
import { BASE_CURRENCY } from '../constants';

export const getContract = contractName => state =>
  get(state, `contracts[${contractName}]`);

export const getFromContract = (value, defaultValue) => contract =>
  get(contract, value, defaultValue);

export const getTotalSupply = getFromContract('totalSupply["0x0"].value', 0);

export const getSymbol = getFromContract('symbol["0x0"].value', '');

export const getFundBaseBalance = state => {
  const fundBalance = 0.5; // ETH
  const baseCurrencyRate = fromRates.getRate(state.rates, 'ETH', BASE_CURRENCY);
  const baseCurrencyFundBalance = fundBalance * baseCurrencyRate;

  return baseCurrencyFundBalance;
};

export const getTokenBaseRate = contract => state => {
  const totalSupply = getTotalSupply(contract);
  if (!totalSupply) return 0;

  return totalSupply / getFundBaseBalance(state);
};

export const kyodoTokenContract = getContract('DecentToken');

export const getRate = (state, from, to) => {
  const tokenContract = kyodoTokenContract(state);
  return fromRates.getRate(state.rates, from, to, {
    symbol: getSymbol(tokenContract),
    rate: getTokenBaseRate(tokenContract)(state),
  });
};

const reducer = combineReducers({
  routing: routerReducer,
  rates,
  ...drizzleReducers,
});

export default reducer;
