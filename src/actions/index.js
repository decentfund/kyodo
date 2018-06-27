import * as types from '../constants';

export function loadRate(currency) {
  return {
    type: types.LOAD_RATE_REQUEST,
    currency,
  };
}
