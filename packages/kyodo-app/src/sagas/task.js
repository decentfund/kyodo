import axios from 'axios';
import { call, select, put, apply } from 'redux-saga/effects';
import { BACKEND_URI, CREATE_TASK_SUCCESS } from '../constants';

export function* getTaskIpfsHash(payload) {
  const apiURI = `${BACKEND_URI}/task/hash`;
  const {
    data: { hash: ipfsHash },
  } = yield call(axios.post, apiURI, payload);

  return ipfsHash;
}

// signSetTaskWorkerRole
export const signSetTaskWorkerRole = async (colonyClient, operationJSON) => {
  // restore operation
  const setTaskWorkerRoleOperation = await colonyClient.setTaskWorkerRole.restoreOperation(
    operationJSON,
  );

  // check if required signees includes current user address
  if (
    setTaskWorkerRoleOperation.requiredSignees.includes(
      colonyClient.adapter.wallet.address.toLowerCase(),
    )
  ) {
    // sign set task worker role operation
    await setTaskWorkerRoleOperation.sign();
  }

  // check for missing signees
  if (setTaskWorkerRoleOperation.missingSignees.length === 0) {
    // send set task worker role operation
    const tx = await setTaskWorkerRoleOperation.send();

    // mark task on backend
    localStorage.removeItem('setTaskWorkerRoleOperationJSON');

    // check unsuccessful
    if (!tx.successful) {
      // throw error
      throw Error('Transaction Failed: ' + tx.meta.transaction.hash);
    }
  } else {
    // serialize operation into JSON format
    const setTaskWorkerRoleOperationJSON = setTaskWorkerRoleOperation.toJSON();

    // save operation to backend
    localStorage.setItem(
      'setTaskWorkerRoleOperationJSON',
      setTaskWorkerRoleOperationJSON,
    );
  }

  // return operation
  return setTaskWorkerRoleOperation;
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
    await signSetTaskWorkerRole(colonyClient, setTaskWorkerRoleOperationJSON);
  }

  // return id
  return taskId;
};

export function* createTask({ domain, ipfsHash, amount }) {
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

    yield put({
      type: CREATE_TASK_SUCCESS,
      payload: taskId,
    });
  } catch (e) {
    console.log(e);
  }
}
