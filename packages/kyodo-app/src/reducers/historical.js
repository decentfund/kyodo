import merge from 'lodash/merge';
import { LOAD_HISTORICAL_RATES_SUCCESS } from '../constants';

export const getRate = (state, from, to, date) => {
  if (!state[date] || !state[date][from] || !state[date][to]) return 0;

  return state[date][from] / state[date][to];
};

export default (state = {}, action) => {
  switch (action.type) {
    case LOAD_HISTORICAL_RATES_SUCCESS:
      return merge({}, state, action.data);
    default:
      return state;
  }
};
