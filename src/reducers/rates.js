import { LOAD_RATE_SUCCESS, BASE_CURRENCY } from '../constants';

export const getRate = (state, from, to, kyodoToken) => {
  if (
    kyodoToken &&
    kyodoToken.symbol &&
    (from === kyodoToken.symbol || to === kyodoToken.symbol)
  ) {
    if (from === kyodoToken.symbol) {
      return kyodoToken.rate / state[to];
    }
    return state[from] / kyodoToken.rate;
  }
  if (!state[from] || !state[to]) return 0;

  return state[from] / state[to];
};

export default (
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
