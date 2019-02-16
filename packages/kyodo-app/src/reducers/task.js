import { GET_TASKS_COUNT_SUCCESS, GET_TASK_SUCCESS } from '../constants';

export default (
  state = {
    transactionKey: null,
  },
  action,
) => {
  switch (action.type) {
    case GET_TASK_SUCCESS:
      return {
        ...state,
        transactionKey: action.payload,
      };
    default:
      return state;
  }
};
