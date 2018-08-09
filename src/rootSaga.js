import axios from 'axios';
import {
  all,
  fork,
  call,
  put,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';
import { drizzleSagas } from 'drizzle';
import {
  LOAD_RATE_REQUEST,
  LOAD_RATE_SUCCESS,
  LOAD_MULTISIG_BALANCE_REQUEST,
  LOAD_MULTISIG_BALANCE_SUCCESS,
} from './constants';
import { BASE_CURRENCY } from './constants';
import * as fromActions from './actions';

function* loadRate({ currency }) {
  try {
    let rateURI = 'https://min-api.cryptocompare.com/data/';
    if (!Array.isArray(currency)) {
      rateURI = `${rateURI}price?fsym=${currency}`;
    } else {
      rateURI = `${rateURI}pricemulti?fsyms=${currency}`;
    }
    rateURI = `${rateURI}&tsyms=${BASE_CURRENCY}`;
    const { data } = yield call(axios.get, rateURI);
    let rates = {};
    if (!Array.isArray(currency)) {
      rates[currency] = data[BASE_CURRENCY];
    } else {
      currency.map(c => (rates[c] = data[c][BASE_CURRENCY]));
    }

    yield put({
      rates,
      type: LOAD_RATE_SUCCESS,
      currency,
    });
  } catch (e) {}
}

function* watchLoadRate() {
  yield takeEvery(LOAD_RATE_REQUEST, loadRate);
}

function* loadBalance() {
  try {
    const address = process.env.REACT_APP_MULTISIG_ADDRESS;
    const apiURI = `http://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`;

    const eventLoad = yield call(axios.get, apiURI);
    const {
      data: { tokens },
    } = eventLoad;

    const tokenSymbols = tokens.map(token => token.tokenInfo.symbol);

    yield put(fromActions.loadRate(tokenSymbols));
    yield put({
      type: LOAD_MULTISIG_BALANCE_SUCCESS,
      data: eventLoad.data,
    });
  } catch (e) {}
}

function* watchLoadBalance() {
  yield takeLatest(LOAD_MULTISIG_BALANCE_REQUEST, loadBalance);
}

export default function* root() {
  yield all([
    ...drizzleSagas.map(saga => fork(saga)),
    watchLoadBalance(),
    watchLoadRate(),
  ]);
}
