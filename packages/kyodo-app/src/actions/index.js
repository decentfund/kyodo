import * as types from '../constants';

export function loadRate(currency) {
  return {
    type: types.LOAD_RATE_REQUEST,
    currency,
  };
}

export function loadHistoricalRates(currencies) {
  return {
    type: types.LOAD_HISTORICAL_RATES_REQUEST,
    currencies,
  };
}

export function loadMultiSigBalance() {
  return {
    type: types.LOAD_MULTISIG_BALANCE_REQUEST,
  };
}

export function loadPeriodTasks() {
  return {
    type: types.LOAD_PERIOD_TASKS_REQUEST,
  };
}

export function loadCurrentPeriodInfo() {
  return {
    type: types.LOAD_CURRENT_PERIOD_INFO_REQUEST,
  };
}

export function getColonyNetworkClient(provider) {
  return {
    type: types.GET_COLONY_NETWORK_CLIENT_REQUEST,
    payload: provider,
  };
}

export function getColony(address) {
  return {
    type: types.GET_COLONY_REQUEST,
    payload: address,
  };
}

export function getDomainsBalances() {
  return {
    type: types.GET_DOMAINS_BALANCES_REQUEST,
  };
}
