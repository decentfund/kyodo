import * as types from '../constants';

export function loadRate() {
  return {
    type: types.LOAD_RATE_REQUEST,
  };
}
