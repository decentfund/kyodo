import { LOAD_CURRENT_PERIOD_INFO_SUCCESS } from '../constants';

const initialState = {
  currentPeriod: {
    periodTitle: '',
    initialBalance: 0,
    currentBalance: 0,
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_CURRENT_PERIOD_INFO_SUCCESS:
      return { ...state, currentPeriod: { ...action.data } };
    default:
      return state;
  }
};
