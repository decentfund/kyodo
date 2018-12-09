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
