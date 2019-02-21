import {
  GET_TASKS_COUNT_SUCCESS,
  GET_TASK_REQUEST,
  GET_TASK_SUCCESS,
} from '../constants';

export default (
  state = {
    count: 0,
    items: {},
  },
  action,
) => {
  switch (action.type) {
    case GET_TASKS_COUNT_SUCCESS:
      return {
        ...state,
        count: action.payload,
      };
    case GET_TASK_REQUEST:
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload]: {
            ...state.items[action.payload],
            loading: true,
          },
        },
      };
    case GET_TASK_SUCCESS:
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.id]: {
            ...state.items[action.payload.id],
            ...action.payload,
            loading: false,
            loaded: true,
          },
        },
      };
      };
    default:
      return state;
  }
};
