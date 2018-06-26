import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { drizzleReducers } from 'drizzle';
import { LOAD_RATE_SUCCESS } from './constants';

export const BASE_CURRENCY = 'EUR';

const rate = (
  state = {
    [BASE_CURRENCY]: 1,
  },
  action,
) => {
  switch (action.type) {
    case LOAD_RATE_SUCCESS:
      return { ...state, [action.currency]: action.rate };
    default:
      return state;
  }
};

export const getRate = (state, from, to) => {
  if (!state[from] || !state[to]) return 0;

  return state[from] / state[to];
};

const reducer = combineReducers({
  routing: routerReducer,
  rate,
  ...drizzleReducers,
});

export default reducer;
