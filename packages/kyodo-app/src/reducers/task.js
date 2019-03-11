import { CREATE_TASK_SUCCESS, CREATE_TASK_STARTED } from '../constants';

export default (
  state = {
    transactionKey: null,
  },
  action,
) => {
  switch (action.type) {
    case CREATE_TASK_STARTED:
      return {
        ...state,
        transactionKey: action.payload,
      };
    case CREATE_TASK_SUCCESS:
      return {
        ...state,
        transactionKey: undefined,
      };
    default:
      return state;
  }
};
