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
