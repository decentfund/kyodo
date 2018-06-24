import axios from 'axios';
import { takeEvery } from 'redux-saga';
import { all, fork, call, put } from 'redux-saga/effects';
import { drizzleSagas } from 'drizzle';
import { LOAD_RATE_REQUEST, LOAD_RATE_SUCCESS } from './constants';

function* loadRate() {
  try {
    const rateURI =
      'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR';
    const eventLoad = yield call(axios.get, rateURI);
    const rate = eventLoad.data['EUR'];

    yield put({
      type: LOAD_RATE_SUCCESS,
      rate,
    });
  } catch (e) {}
}

function* watchLoadRate() {
  yield* takeEvery(LOAD_RATE_REQUEST, loadRate);
}

export default function* root() {
  yield all(drizzleSagas.map(saga => fork(saga)));
  yield fork(watchLoadRate);
}
