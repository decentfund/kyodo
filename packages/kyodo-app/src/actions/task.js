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

export function acceptTask(taskId) {
  return {
    type: types.ACCEPT_TASK_REQUEST,
    payload: taskId,
  };
}

export function assignWorker({ taskId, address }) {
  return {
    type: types.ASSIGN_WORKER_REQUEST,
    payload: { taskId, address },
  };
}
