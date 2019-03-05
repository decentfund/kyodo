import axios from 'axios';
import web3 from 'web3';
import {
  call,
  select,
  put,
  apply,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';
import {
  ACCEPT_TASK_REQUEST,
  ACCEPT_TASK_SUCCESS,
  ASSIGN_WORKER_REQUEST,
  ASSIGN_WORKER_SUCCESS,
  BACKEND_URI,
  CREATE_TASK_SUCCESS,
  GET_TASK_WORKER_REQUEST,
  GET_TASK_WORKER_SUCCESS,
  SUBMIT_TASK_WORK_RATING_REQUEST,
  SUBMIT_TASK_WORK_RATING_SUCCESS,
  GET_TASK_RATINGS_COUNT_SUCCESS,
} from '../constants';

export function* getTaskIpfsHash(payload) {
  // Get title, description and amount to get ipfs hash
  const { amount, title, description } = payload;
  const apiURI = `${BACKEND_URI}/task/hash`;
  const {
    data: { hash: ipfsHash },
  } = yield call(axios.post, apiURI, { amount, title, description });

  return ipfsHash;
}

// signSetTaskWorkerRole
export const signSetTaskWorkerRole = async (
  colonyClient,
  operationJSON,
  address,
  taskId,
) => {
  // restore operation
  const setTaskWorkerRoleOperation = await colonyClient.setTaskWorkerRole.restoreOperation(
    operationJSON,
  );

  // check if required signees includes current user address
  if (
    setTaskWorkerRoleOperation.requiredSignees.includes(
      colonyClient.adapter.wallet._address.toLowerCase(),
    )
  ) {
    // sign set task worker role operation
    await setTaskWorkerRoleOperation.sign();
  }

  // check for missing signees
  if (setTaskWorkerRoleOperation.missingSignees.length === 0) {
    // send set task worker role operation
    const tx = await setTaskWorkerRoleOperation.send({ gasLimit: 400000 });

    // mark task on backend
    const apiURI = `${BACKEND_URI}/task/${taskId}/worker/accept`;
    await axios.post(apiURI);

    // check unsuccessful
    if (!tx.successful) {
      // throw error
      throw Error('Transaction Failed: ' + tx.meta.transaction.hash);
    }
  } else {
    // serialize operation into JSON format
    const setTaskWorkerRoleOperationJSON = setTaskWorkerRoleOperation.toJSON();

    // save operation to backend
    const apiURI = `${BACKEND_URI}/task/${taskId}/worker/assign`;
    await axios.post(apiURI, {
      operationJSON: setTaskWorkerRoleOperationJSON.toString(),
      address,
    });
  }

  // return operation
  return setTaskWorkerRoleOperation;
};

// signRemoveTaskWorkerRole
export const signRemoveTaskWorkerRole = async (colonyClient, operationJSON) => {
  // restore operation
  const removeTaskWorkerRoleOperation = await colonyClient.removeTaskWorkerRole.restoreOperation(
    operationJSON,
  );

  // check if required signees includes current user address
  if (
    removeTaskWorkerRoleOperation.requiredSignees.includes(
      colonyClient.adapter.wallet.address.toLowerCase(),
    )
  ) {
    // sign remove task worker role operation
    await removeTaskWorkerRoleOperation.sign();
  }

  // check for missing signees
  if (removeTaskWorkerRoleOperation.missingSignees.length === 0) {
    // send remove task worker role operation
    const tx = await removeTaskWorkerRoleOperation.send();

    // remove local storage item
    localStorage.removeItem('removeTaskWorkerRoleOperationJSON');

    // check unsuccessful
    if (!tx.successful) {
      // throw error
      throw Error('Transaction Failed: ' + tx.meta.transaction.hash);
    }
  } else {
    // serialize operation into JSON format
    const removeTaskWorkerRoleOperationJSON = removeTaskWorkerRoleOperation.toJSON();

    // save operation to local storage
    localStorage.setItem(
      'removeTaskWorkerRoleOperationJSON',
      removeTaskWorkerRoleOperationJSON,
    );
  }

  // return operation
  return removeTaskWorkerRoleOperation;
};

export const setTaskRole = async (colonyClient, taskId, role, user) => {
  // check manager role
  // if (role === "MANAGER") {
  // // set task manager role
  // const setTaskManagerRoleOperation = await colonyClient.setTaskManagerRole.startOperation(
  // {
  // taskId,
  // user
  // }
  // );

  // // serialize operation into JSON format
  // const setTaskManagerRoleOperationJSON = setTaskManagerRoleOperation.toJSON();

  // // sign set task manager role
  // await signSetTaskManagerRole(colonyClient, setTaskManagerRoleOperationJSON);
  // }

  // // check evaluator role
  // if (role === "EVALUATOR") {
  // // set task evaluator role
  // const setTaskEvaluatorRoleOperation = await colonyClient.setTaskEvaluatorRole.startOperation(
  // {
  // taskId,
  // user
  // }
  // );

  // // serialize operation into JSON format
  // const setTaskEvaluatorRoleOperationJSON = setTaskEvaluatorRoleOperation.toJSON();

  // // sign set task evaluator role
  // await signSetTaskEvaluatorRole(
  // colonyClient,
  // setTaskEvaluatorRoleOperationJSON
  // );
  // }

  // check worker role
  if (role === 'WORKER') {
    // set task worker role
    const setTaskWorkerRoleOperation = await colonyClient.setTaskWorkerRole.startOperation(
      {
        taskId,
        user,
      },
    );

    console.log('Set Task Worker Role Operation');
    console.log(setTaskWorkerRoleOperation);

    // serialize operation into JSON format
    const setTaskWorkerRoleOperationJSON = setTaskWorkerRoleOperation.toJSON();

    // sign set task worker role
    await signSetTaskWorkerRole(
      colonyClient,
      setTaskWorkerRoleOperationJSON,
      user,
      taskId,
    );
  }

  // return id
  return taskId;
};

export function* createTask({ domain, ipfsHash, amount, assignee }) {
  // TODO: On every step we need to reflect status in store to further display what's happening in the UI
  const {
    colony: { client },
  } = yield select();

  try {
    const {
      eventData: { potId, taskId },
    } = yield apply(client.createTask, client.createTask.send, [
      {
        specificationHash: ipfsHash,
        domainId: parseInt(domain),
      },
      // FIXME: Incorrect gas amount being calculated
      { gasLimit: 400000 },
    ]);

    yield apply(client.moveFundsBetweenPots, client.moveFundsBetweenPots.send, [
      {
        fromPot: parseInt(domain),
        toPot: potId,
        amount,
        token: client.token.contract.address,
      },
      // FIXME: Incorrect gas amount being calculated
      { gasLimit: 400000 },
    ]);

    if (assignee) {
      yield put({
        type: ASSIGN_WORKER_REQUEST,
        payload: { taskId, address: assignee },
      });
    }
    yield put({
      type: CREATE_TASK_SUCCESS,
      payload: taskId,
    });
  } catch (e) {
    console.log(e);
  }
}

// signTask

export async function signTask(colonyClient, taskId) {
  // set address
  const address = colonyClient.contract.address;

  // get JSON formatted task worker role operation from local storage
  const removeTaskWorkerRoleOperationJSON = localStorage.getItem(
    'removeTaskWorkerRoleOperationJSON',
  );

  // get JSON formatted task worker role operation from local storage
  const setTaskWorkerRoleOperationJSON = localStorage.getItem(
    'setTaskWorkerRoleOperationJSON',
  );

  // set setTaskWorkerRoleOperation
  const setTaskWorkerRoleOperation = JSON.parse(setTaskWorkerRoleOperationJSON);

  // set removeTaskWorkerRoleOperation
  const removeTaskWorkerRoleOperation = JSON.parse(
    removeTaskWorkerRoleOperationJSON,
  );

  // check if task worker role operation exists for contract and task
  if (
    setTaskWorkerRoleOperationJSON &&
    setTaskWorkerRoleOperation.payload.sourceAddress === address &&
    setTaskWorkerRoleOperation.payload.inputValues.taskId === taskId
  ) {
    // sign set task worker role
    await signSetTaskWorkerRole(colonyClient, setTaskWorkerRoleOperationJSON);
  }

  // check if task worker role operation exists for contract and task
  if (
    removeTaskWorkerRoleOperationJSON &&
    removeTaskWorkerRoleOperation.payload.sourceAddress === address &&
    removeTaskWorkerRoleOperation.payload.inputValues.taskId === taskId
  ) {
    // sign remove task worker role
    await signRemoveTaskWorkerRole(
      colonyClient,
      removeTaskWorkerRoleOperationJSON,
    );
  }

  // return id
  return taskId;
}

export function* loadWorker(taskId) {
  const {
    colony: { client },
  } = yield select();

  yield put({
    type: GET_TASK_WORKER_REQUEST,
    payload: { taskId },
  });

  let worker = yield call([client.getTaskRole, client.getTaskRole.call], {
    taskId,
    role: 'WORKER',
  });

  let workerPayload = {};

  if (!worker.address) {
    const { data } = yield call(
      axios.get,
      `${BACKEND_URI}/task/${taskId}/worker/operation`,
    );
    workerPayload = data;
  } else {
    workerPayload = {
      ...worker,
      accepted: true,
    };
  }

  yield put({
    type: GET_TASK_WORKER_SUCCESS,
    payload: { ...workerPayload, taskId },
  });
}

function* assignWorker({ payload: { taskId, address } }) {
  const {
    colony: { client },
  } = yield select();

  yield call(setTaskRole, client, taskId, 'WORKER', address);
  yield call(loadWorker, taskId);
}

export function* watchAssignWorker() {
  yield takeEvery(ASSIGN_WORKER_REQUEST, assignWorker);
}

function* submitTaskWorkRating({ payload: { rating, taskId, role } }) {
  const {
    colony: { client },
  } = yield select();

  const secret = yield call(generateSecret, rating);

  yield apply(client.submitTaskWorkRating, client.submitTaskWorkRating.send, [
    {
      taskId,
      role,
      secret,
    },
    { gasLimit: 400000 },
  ]);

  const { count } = yield call(
    [client.getTaskWorkRatings, client.getTaskWorkRatings.call],
    {
      taskId,
    },
  );

  yield put({
    type: GET_TASK_RATINGS_COUNT_SUCCESS,
    payload: { count, taskId },
  });
}

export function* watchSubmitTaskWorkRating() {
  yield takeEvery(SUBMIT_TASK_WORK_RATING_REQUEST, submitTaskWorkRating);
}

function* generateSecret(value) {
  const {
    colony: { client },
  } = yield select();

  // Set salt value
  const salt = web3.utils.sha3('secret');

  const { secret } = yield call(
    [client.generateSecret, client.generateSecret.call],
    {
      salt,
      value,
    },
  );

  return secret;
}

function* acceptTask({ payload: taskId }) {
  const {
    colony: { client },
    tasks: { items: tasks },
  } = yield select();
  const operationJSON = tasks[taskId].assignee.operationJSON;
  const specificationHash = tasks[taskId].specificationHash;

  yield call(
    signSetTaskWorkerRole,
    client,
    operationJSON,
    client.adapter.wallet._address.toLowerCase(),
    taskId,
  );
  yield call(loadWorker, taskId);

  const secret = yield call(generateSecret, 3);

  yield apply(
    client.submitTaskDeliverableAndRating,
    client.submitTaskDeliverableAndRating.send,
    [
      {
        taskId,
        deliverableHash: specificationHash,
        secret,
      },
      { gasLimit: 400000 },
    ],
  );
}

export function* watchAcceptTask() {
  yield takeLatest(ACCEPT_TASK_REQUEST, acceptTask);
}
