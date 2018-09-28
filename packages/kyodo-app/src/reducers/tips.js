import { LOAD_PERIOD_TASKS_SUCCESS } from '../constants';

export default (state = [], action) => {
  switch (action.type) {
    case LOAD_PERIOD_TASKS_SUCCESS:
      return [...state, ...action.tasks];
    default:
      return state;
  }
};
