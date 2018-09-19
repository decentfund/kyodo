import { combineReducers } from 'redux';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { routerReducer } from 'react-router-redux';
import { drizzleReducers } from 'drizzle';
import { createSelector } from 'reselect';
import get from 'lodash/get';
import rates, * as fromRates from './rates';
import balances from './balances';
import historical, * as fromHistorical from './historical';
import { BASE_CURRENCY } from '../constants';

const moment = extendMoment(Moment);

export const getContract = contractName => state =>
  get(state, `contracts[${contractName}]`);

export const getFromContract = (value, defaultValue) => contract =>
  get(contract, value, defaultValue);

export const getDecimals = getFromContract('decimals["0x0"].value', 0);

export const getTotalSupply = contract =>
  getFromContract('totalSupply["0x0"].value', 0)(contract) /
  Math.pow(10, getDecimals(contract));

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

export const getHistoricalFundBaseBalance = (balances, historical, date) => {
  const baseCurrencyFundBalance = Object.keys(balances).reduce((prev, key) => {
    const baseCurrencyRate = fromHistorical.getRate(
      historical,
      key,
      BASE_CURRENCY,
      date,
    );
    return balances[key] * baseCurrencyRate + prev;
  }, 0);

  return baseCurrencyFundBalance;
};

export const getTokenBaseRate = contract => state => {
  const totalSupply = getTotalSupply(contract);
  if (!totalSupply) return 0;

  return getFundBaseBalance(state) / totalSupply;
};

export const kyodoTokenContract = getContract('DecentToken');

// export const getRate = createSelector([getTokenContract, getRates], (kyodoTokenContract, rates) => {
export const getRate = (state, from, to) => {
  const tokenContract = kyodoTokenContract(state);
  return fromRates.getRate(state.rates, from, to, {
    symbol: getSymbol(tokenContract),
    rate: getTokenBaseRate(tokenContract)(state),
  });
};

export const getStateBalances = state => state.balances;
export const getTokenContract = state => kyodoTokenContract(state);
export const getRates = state => state.rates;
export const getStateHistorical = state => state.historical;

export const getBalances = createSelector(
  [getStateBalances, getRates],
  (balances, rates) => {
    return Object.keys(balances).map(key => {
      return {
        ticker: key,
        balance: balances[key],
        tokenPrice: fromRates.getRate(rates, key, BASE_CURRENCY),
      };
    });
  },
);

export const getHistorical = createSelector(
  [getStateBalances, getStateHistorical],
  (balances, historical) => {
    const range = moment.rangeFromInterval('day', -30, moment.now());
    const dates = Array.from(range.by('day')).map(d => d.format('YYYY-MM-DD'));
    const data = dates.map(date => ({
      date,
      balanceEUR: getHistoricalFundBaseBalance(balances, historical, date),
    }));
    return data;
  },
);

const reducer = combineReducers({
  routing: routerReducer,
  rates,
  balances,
  historical,
  ...drizzleReducers,
});

export default reducer;
