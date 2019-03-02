import axios from 'axios';
import { call, select, put } from 'redux-saga/effects';
import { BACKEND_URI, CREATE_TASK_STARTED } from '../constants';
import { drizzle } from '../store';

export function* getTaskIpfsHash(payload) {
  const apiURI = `${BACKEND_URI}/task/hash`;
  const {
    data: { hash: ipfsHash },
  } = yield call(axios.post, apiURI, payload);

  return ipfsHash;
}

export function* createTask({ domain, ipfsHash, amount }) {
  const state = yield select();
  const key = yield call(
    drizzle.contracts.KyodoDAO.methods.createTask.cacheSend,
    domain,
    ipfsHash,
    amount,
    { from: state.accounts[0] },
  );

  // FIXME: Should subscribe to new blocks to wait till transaction resolves
  // Currently just storing transaction key in state
  // FIXME: What if user rejected transaction?
  yield put({
    type: CREATE_TASK_STARTED,
    payload: key,
  });
}
