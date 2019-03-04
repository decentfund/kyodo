import {
  GET_TASKS_COUNT_SUCCESS,
  GET_TASK_REQUEST,
  GET_TASK_SUCCESS,
  GET_TASK_MANAGER_REQUEST,
  GET_TASK_MANAGER_SUCCESS,
  GET_TASK_OPERATION_REQUEST,
  GET_TASK_OPERATION_SUCCESS,
} from '../constants';

const assignee = (action, state) => {
  switch (action.type) {
    case GET_TASK_OPERATION_SUCCESS:
      return {
        ...state,
        ...action.payload,
        loading: false,
        loaded: true,
      };
    case GET_TASK_OPERATION_REQUEST:
      return {
        ...state,
        ...action.payload,
        loading: true,
      };
    default: {
      return state;
    }
  }
};

const manager = (action, state) => {
  switch (action.type) {
    case GET_TASK_MANAGER_SUCCESS:
      return {
        ...state,
        ...action.payload,
        loading: false,
        loaded: true,
      };
    case GET_TASK_MANAGER_REQUEST:
      return {
        ...state,
        ...action.payload,
        loading: true,
      };
    default: {
      return state;
    }
  }
};

export const getTasks = state => state.items;

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
            manager: {},
            assignee: { loading: true },
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
    case GET_TASK_MANAGER_REQUEST:
    case GET_TASK_MANAGER_SUCCESS:
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.taskId]: {
            ...state.items[action.payload.taskId],
            manager: manager(
              action,
              state.items[action.payload.taskId].manager,
            ),
          },
        },
      };
    case GET_TASK_OPERATION_REQUEST:
    case GET_TASK_OPERATION_SUCCESS:
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.taskId]: {
            ...state.items[action.payload.taskId],
            assignee: assignee(
              action,
              state.items[action.payload.taskId].assignee,
            ),
          },
        },
      };
    default:
      return state;
  }
};
