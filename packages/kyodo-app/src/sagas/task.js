import axios from 'axios';
import { call } from 'redux-saga/effects';
import { BACKEND_URI } from '../constants';

export function* getTaskIpfsHash(payload) {
  const apiURI = `${BACKEND_URI}/task/hash`;
  const {
    data: { hash: ipfsHash },
  } = yield call(axios.post, apiURI, payload);

  return ipfsHash;
}
