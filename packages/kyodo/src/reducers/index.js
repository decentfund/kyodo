import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { drizzleReducers } from 'drizzle';
import get from 'lodash/get';
import rates, * as fromRates from './rates';
import balances from './balances';
import { BASE_CURRENCY } from '../constants';

export const getContract = contractName => state =>
  get(state, `contracts[${contractName}]`);

export const getFromContract = (value, defaultValue) => contract =>
  get(contract, value, defaultValue);

export const getTotalSupply = getFromContract('totalSupply["0x0"].value', 0);

export const getSymbol = getFromContract('symbol["0x0"].value', '');

export const getOwner = getFromContract('owner["0x0"].value');

export const getCurrentPeriodStartTime = getFromContract(
  'currentPeriodStartTime["0x0"].value',
);

export const getPeriodDaysLength = getFromContract(
  'periodDaysLength["0x0"].value',
);

export const getWhitelistedAddresses = getFromContract(
  'getWhitelistedAddresses["0x0"].value',
  [],
);

export const getFundBaseBalance = state => {
  const baseCurrencyFundBalance = Object.keys(state.balances).reduce(
    (prev, key) => {
      const baseCurrencyRate = fromRates.getRate(
        state.rates,
        key,
        BASE_CURRENCY,
      );
      return state.balances[key] * baseCurrencyRate + prev;
    },
    0,
  );

  return baseCurrencyFundBalance;
};

export const getTokenBaseRate = contract => state => {
  const totalSupply = getTotalSupply(contract);
  if (!totalSupply) return 0;

  return getFundBaseBalance(state) / totalSupply;
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
  balances,
  ...drizzleReducers,
});

export default reducer;
