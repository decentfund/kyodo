import { combineReducers } from 'redux';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { routerReducer } from 'react-router-redux';
import { drizzleReducers } from 'drizzle';
import { createSelector } from 'reselect';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import rates, * as fromRates from './rates';
import balances from './balances';
import users from './users';
import tips from './tips';
import historical, * as fromHistorical from './historical';
import periods from './periods';
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

export const getHistoricalFundBalance = (
  balances,
  historical,
  currency,
  date,
) => {
  const baseCurrencyFundBalance = Object.keys(balances).reduce((prev, key) => {
    const baseCurrencyRate = fromHistorical.getRate(
      historical,
      key,
      currency,
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

export const kyodoTokenContract = getContract('Token');

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
      balanceETH: getHistoricalFundBalance(balances, historical, 'ETH', date),
    }));
    return data;
  },
);

export const getHistoricalTokenPrice = createSelector(
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

export const getCurrentUserAddress = state => state.accounts[0];
export const getUserAliases = state => state.users.aliases;

export const getCurrentUserAlias = createSelector(
  [getCurrentUserAddress, getUserAliases],
  (address, aliases) => aliases[address],
);
export const getTips = state => state.tips;

export const getTipsToUser = createSelector(
  [getTips, getCurrentUserAlias],
  (tips, alias) => tips.filter(t => t.to === alias),
);

export const getTipsFromUser = createSelector(
  [getTips, getCurrentUserAlias],
  (tips, alias) => tips.filter(t => t.from === alias),
);

export const getUserTips = createSelector(
  [getTips, getCurrentUserAlias],
  (tips, alias) => tips.filter(t => t.to === alias || t.from === alias),
);

export const getTotalUserTips = createSelector(
  [getTipsToUser, getTipsFromUser],
  (toUser, fromUser) => ({
    toUser: toUser.reduce((a, t) => a + t.amount, 0),
    byUser: fromUser.reduce((a, t) => a + t.amount, 0),
  }),
);

const formatTipsPerDomain = tips =>
  tips.reduce(
    (memo, { domain, amount }) => {
      if (memo[domain]) {
        memo[domain] = memo[domain] + amount;
      } else {
        memo[domain] = amount;
      }

      memo.total += amount;
      return memo;
    },
    { total: 0 },
  );

export const getTipsByDomain = createSelector(getTipsToUser, tips => {
  return formatTipsPerDomain(tips);
});

export const getPointsDistribution = createSelector(getTips, tips => {
  return formatTipsPerDomain(tips);
});

const getDomainsFromTips = createSelector(getTips, tips =>
  Object.keys(
    tips.reduce((memo, { domain }) => ({ ...memo, [domain]: true }), {})
  )
);

const getUsersFromTips = createSelector(getTips, tips =>
  Object.keys(
    tips.reduce((memo, { to }) => ({ ...memo, [to]: true }), {})
  )
);

const getTipsByUser = createSelector(getTips, tips => groupBy(tips, 'to'));

// Should return array of users with their names, addresses, points earned per domains,
// highest earning in domain, total points earned in current period
export const getLeaderboardData = createSelector(
  [getDomainsFromTips, getUsersFromTips, getTipsByUser],
  (domains, users, tipsByUser) => {

    const userStats = Object.keys(tipsByUser)
      .map(user => {
        const userTips = tipsByUser[user];
        const userAddress = userTips[0].toAddress;
        const tipsPerDomain = formatTipsPerDomain(userTips);
        return {
          user,
          userAddress,
          tips: tipsPerDomain,
        };
      });

    const domainStats = domains.map(domain => {
      let leader = { user: '', amount: 0 };
      userStats.forEach(data => {
        if (data.tips[domain] && data.tips[domain] > leader.amount) {
          leader = {
            user: data.user,
            amount: data.tips[domain],
          };
        }
      });
      return {
        ...leader,
        domain,
      };
    });

    return {
      domains,
      users,
      tipsByUser,
      userStats,
      domainStats,
    };
  }
);

export const getCurrentPeriodInfo = state => state.periods.currentPeriod;

const reducer = combineReducers({
  routing: routerReducer,
  rates,
  balances,
  historical,
  tips,
  users,
  periods,
  ...drizzleReducers,
});

export default reducer;
