import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { drizzleReducers } from 'drizzle';
import { LOAD_RATE_SUCCESS } from './constants';

const rate = (state = {}, action) => {
  switch (action.type) {
    case LOAD_RATE_SUCCESS:
      return action.rate;
    default:
      return state;
  }
};

const reducer = combineReducers({
  routing: routerReducer,
  rate,
  ...drizzleReducers,
});

export default reducer;
