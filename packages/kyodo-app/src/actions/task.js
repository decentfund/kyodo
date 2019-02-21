import * as types from '../constants';

export function createTask(payload) {
  return {
    type: types.CREATE_TASK_REQUEST,
    payload,
  };
}

export function createTaskSuccess() {
  return {
    type: types.CREATE_TASK_SUCCESS,
  };
}

