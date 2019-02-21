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

export function getTaskManager(taskId) {
  return {
    type: types.GET_TASK_MANAGER_REQUEST,
    payload: taskId,
  };
}
