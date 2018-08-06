import * as types from '../constants';

export function loadRate(currency) {
  return {
    type: types.LOAD_RATE_REQUEST,
    currency,
  };
}

export function loadMultiSigBalance() {
  return {
    type: types.LOAD_MULTISIG_BALANCE_REQUEST,
  };
}
