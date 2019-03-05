import axios from 'axios';
import moment from 'moment';
import orderBy from 'lodash/orderBy';
import { convertAmount } from '@kyodo/shared/token';
import { getDecimals, getContract } from './reducers';
import {
  all,
  fork,
  call,
  put,
  takeEvery,
  takeLatest,
  select,
  apply,
  take,
} from 'redux-saga/effects';
import { drizzleSagas } from 'drizzle';
import {
  BACKEND_URI,
  LOAD_RATE_REQUEST,
  LOAD_RATE_SUCCESS,
  LOAD_PERIOD_TASKS_REQUEST,
  LOAD_PERIOD_TASKS_SUCCESS,
  LOAD_CURRENT_PERIOD_INFO_REQUEST,
  LOAD_CURRENT_PERIOD_INFO_SUCCESS,
  LOAD_HISTORICAL_RATES_REQUEST,
  LOAD_HISTORICAL_RATES_SUCCESS,
  LOAD_MULTISIG_BALANCE_REQUEST,
  LOAD_MULTISIG_BALANCE_SUCCESS,
  GET_COLONY_NETWORK_CLIENT_REQUEST,
  GET_COLONY_NETWORK_CLIENT_SUCCESS,
  GET_COLONY_REQUEST,
  GET_COLONY_SUCCESS,
  GET_POT_BALANCE_REQUEST,
  GET_POT_BALANCE_SUCCESS,
  GET_DOMAINS_BALANCES_REQUEST,
  GET_DOMAINS_REQUEST,
  GET_DOMAINS_SUCCESS,
  CREATE_TASK_REQUEST,
  CREATE_TASK_STARTED,
  CREATE_TASK_SUCCESS,
  GET_TASKS_REQUEST,
  GET_TASKS_SUCCESS,
  GET_TASKS_COUNT_REQUEST,
  GET_TASKS_COUNT_SUCCESS,
  GET_TASK_REQUEST,
  GET_TASK_SUCCESS,
  GET_TASK_MANAGER_REQUEST,
  GET_TASK_MANAGER_SUCCESS,
  GET_TASK_WORKER_REQUEST,
  GET_TASK_WORKER_SUCCESS,
  GET_TASK_DETAILS_SUCCESS,
  ACCEPT_TASK_REQUEST,
  ACCEPT_TASK_SUCCESS,
} from './constants';
import { BASE_CURRENCY } from './constants';
import * as fromActions from './actions';
import * as fromNetworkHelpers from './helpers/network';
import * as fromTaskSagas from './sagas/task';

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
    // Use env multisig address or default decentfund.eth (0xba7590098ad09ca35fde9ede64e58b72552bb10c)
    const address =
      process.env.REACT_APP_MULTISIG_ADDRESS ||
      '0xba7590098ad09ca35fde9ede64e58b72552bb10c';

    const apiURI = `http://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`;

    const eventLoad = yield call(axios.get, apiURI);
    const {
      data: { tokens },
    } = eventLoad;

    const tokenSymbols = tokens.map(token => token.tokenInfo.symbol);

    yield put(fromActions.loadRate(tokenSymbols));
    yield put(fromActions.loadHistoricalRates(tokenSymbols));
    yield put({
      type: LOAD_MULTISIG_BALANCE_SUCCESS,
      data: eventLoad.data,
    });
  } catch (e) {}
}

function* watchLoadBalance() {
  yield takeLatest(LOAD_MULTISIG_BALANCE_REQUEST, loadBalance);
}

function* loadHistoricalRate(currency) {
  const apiURI = `https://min-api.cryptocompare.com/data/histoday?fsym=${currency}&tsym=${BASE_CURRENCY}&limit=30`;

  const eventLoad = yield call(axios.get, apiURI);
  const {
    data: { Data },
  } = eventLoad;

  const data = {};
  Data.forEach(value => {
    data[moment.unix(value.time).format('YYYY-MM-DD')] = {
      [currency]: value.close,
      [BASE_CURRENCY]: 1,
    };
  });

  yield put({
    type: LOAD_HISTORICAL_RATES_SUCCESS,
    data,
  });
}

function* loadHistoricalRates({ currencies }) {
  try {
    // loop through currencies and create a load request
    yield currencies.map(currency => call(loadHistoricalRate, currency));
  } catch (e) {}
}

function* watchLoadHistoricalRates() {
  yield takeLatest(LOAD_HISTORICAL_RATES_REQUEST, loadHistoricalRates);
}

function* loadPeriodTasks() {
  try {
    const apiURI = `${BACKEND_URI}/tips`;

    const { data } = yield call(axios.get, apiURI);
    const tasks = orderBy(
      data.map(t => ({
        title: t.task.taskTitle,
        domain: t.domain.domainTitle,
        from: t.from.alias || t.from.address,
        fromAddress: t.from.address,
        to: t.to.alias || t.to.address,
        toAddress: t.to.address,
        id: t._id,
        amount: t.amount,
        dateCreated: t.dateCreated,
      })),
      ['dateCreated'],
      ['desc'],
    );

    yield put({
      type: LOAD_PERIOD_TASKS_SUCCESS,
      tasks,
    });
  } catch (e) {
    console.log(e);
  }
}

function* watchLoadTasks() {
  yield takeLatest(LOAD_PERIOD_TASKS_REQUEST, loadPeriodTasks);
}

function* loadPeriodInfo() {
  try {
    const apiURI = `${BACKEND_URI}/period/summary`;
    const { data } = yield call(axios.get, apiURI);

    yield put({
      type: LOAD_CURRENT_PERIOD_INFO_SUCCESS,
      data,
    });
  } catch (e) {
    console.log(e);
  }
}

function* watchLoadCurrentPeriodInfo() {
  yield takeLatest(LOAD_CURRENT_PERIOD_INFO_REQUEST, loadPeriodInfo);
}

function* getColonyNetworkClient({ payload: provider }) {
  try {
    // get network id from the state
    const {
      web3: { networkId },
    } = yield select();

    window.ethereum.enable();
    // getting colony network client
    const colonyNetworkClient = yield call(
      fromNetworkHelpers.getColonyNetworkClient,
      networkId,
      provider,
    );

    yield put({
      type: GET_COLONY_NETWORK_CLIENT_SUCCESS,
      payload: colonyNetworkClient,
    });
  } catch (e) {
    console.log(e);
  }
}

function* watchGetColonyNetwork() {
  yield takeLatest(GET_COLONY_NETWORK_CLIENT_REQUEST, getColonyNetworkClient);
}

function* getColony({ payload: address }) {
  try {
    // get network id from the state
    const {
      colony: { networkClient },
    } = yield select();

    // getting colony network client
    const colonyClient = yield apply(
      networkClient,
      networkClient.getColonyClientByAddress,
      [address],
    );

    yield put({
      type: GET_COLONY_SUCCESS,
      payload: colonyClient,
    });

    yield put(fromActions.getDomains());
    yield put(fromActions.getTasks());
  } catch (e) {
    console.log(e);
  }
}

function* watchGetColony() {
  yield takeLatest(GET_COLONY_REQUEST, getColony);
}

function* getPotBalance({ payload: potId }) {
  const {
    colony: { client },
  } = yield select();

  try {
    const { balance } = yield call(
      [client.getPotBalance, client.getPotBalance.call],
      {
        potId,
        token: client.token.contract.address,
      },
    );

    const potBalance = balance.toString();
    yield put({
      type: GET_POT_BALANCE_SUCCESS,
      payload: {
        potBalance,
        potId,
      },
    });
  } catch (e) {
    console.log(e);
  }
}

function* watchGetPotBalance() {
  yield takeEvery(GET_POT_BALANCE_REQUEST, getPotBalance);
}

function* getDomainsBalances() {
  const {
    colony: { domains },
  } = yield select();

  for (let domain of domains) {
    yield put({
      type: GET_POT_BALANCE_REQUEST,
      payload: domain.potId,
    });
  }
}

function* watchGetDomainsBalances() {
  yield takeLatest(GET_DOMAINS_BALANCES_REQUEST, getDomainsBalances);
}

function* getDomains() {
  const apiURI = `${BACKEND_URI}/domains`;
  const { data } = yield call(axios.get, apiURI);
  console.log(data);

  // set domains to store
  yield put({
    type: GET_DOMAINS_SUCCESS,
    payload: data.map(domain => ({
      name: domain.domainTitle,
      potId: domain.potId,
      id: domain.domainId,
    })),
  });

  // get domains balances
  yield put(fromActions.getDomainsBalances());
}

function* watchGetDomains() {
  yield takeLatest(GET_DOMAINS_REQUEST, getDomains);
}

function* getTaskCount(client) {
  try {
    const { count } = yield call([
      client.getTaskCount,
      client.getTaskCount.call,
    ]);

    return count;
  } catch (e) {
    console.log(e);
  }
}

function* watchGetTasks() {
  while (true) {
    yield take(GET_TASKS_REQUEST);

    const {
      colony: { client },
    } = yield select();

    const count = yield getTaskCount(client);
    yield put({
      type: GET_TASKS_COUNT_SUCCESS,
      payload: count,
    });

    yield takeEvery(GET_TASK_REQUEST, getTask);

    for (let i = 1; i <= count; i++) {
      yield put({
        type: GET_TASK_REQUEST,
        payload: i,
      });
    }
  }
}

function* getTask({ payload: taskId }) {
  const {
    colony: { client },
  } = yield select();

  try {
    const colonyDetails = yield call([client.getTask, client.getTask.call], {
      taskId,
    });

    const specificationHashURI = `${BACKEND_URI}/task/${
      colonyDetails.specificationHash
    }`;
    const { data: specificationDetails } = yield call(
      axios.get,
      specificationHashURI,
    );

    const details = {
      ...colonyDetails,
      ...specificationDetails,
    };

    yield put({
      type: GET_TASK_SUCCESS,
      payload: details,
    });

    yield put({
      type: GET_TASK_MANAGER_REQUEST,
      payload: { taskId },
    });

    const manager = yield call([client.getTaskRole, client.getTaskRole.call], {
      taskId,
      role: 'MANAGER',
    });

    yield put({
      type: GET_TASK_MANAGER_SUCCESS,
      payload: { ...manager, taskId },
    });

    yield call(fromTaskSagas.loadWorker, taskId);

    // All details to display tosks are loaded
    yield put({
      type: GET_TASK_DETAILS_SUCCESS,
      payload: {
        id: taskId,
      },
    });

    if (colonyDetails.potId) {
      yield put({
        type: GET_POT_BALANCE_REQUEST,
        payload: colonyDetails.potId,
      });
    }
  } catch (e) {
    console.log(e);
  }
}

function* createTask({ payload }) {
  const ipfsHash = yield call(fromTaskSagas.getTaskIpfsHash, payload);

  // destructuring payload
  const { domain, amount, assignee } = payload;

  // get tokn decimals
  const state = yield select();
  const decimals = getDecimals(getContract('Token')(state));

  // get BN number for amount
  const convertedAmount = convertAmount(amount, decimals);

  yield call(fromTaskSagas.createTask, {
    domain,
    amount: convertedAmount,
    ipfsHash,
    assignee,
  });
}

function* watchCreateTask() {
  yield takeLatest(CREATE_TASK_REQUEST, createTask);
}

function* acceptTask({ payload: taskId }) {
  const {
    colony: { client },
    tasks: { items: tasks },
  } = yield select();
  const operationJSON = tasks[taskId].assignee.operationJSON;

  yield call(
    fromTaskSagas.signSetTaskWorkerRole,
    client,
    operationJSON,
    client.adapter.wallet._address.toLowerCase(),
    taskId,
  );
  yield call(fromTaskSagas.loadWorker, taskId);
}

function* watchAcceptTask() {
  yield takeLatest(ACCEPT_TASK_REQUEST, acceptTask);
}

function* createTaskSuccess() {
  yield put(fromActions.getTasks());
  yield getDomainsBalances();
}

function* watchCreateTaskSuccess() {
  yield takeLatest(CREATE_TASK_SUCCESS, createTaskSuccess);
}

export default function* root() {
  yield all([
    ...drizzleSagas.map(saga => fork(saga)),
    watchLoadBalance(),
    watchLoadRate(),
    watchLoadHistoricalRates(),
    watchLoadTasks(),
    watchLoadCurrentPeriodInfo(),
    watchGetColonyNetwork(),
    watchGetColony(),
    watchGetPotBalance(),
    watchGetDomainsBalances(),
    watchGetDomains(),
    watchGetTasks(),
    watchCreateTask(),
    watchCreateTaskSuccess(),
    watchAcceptTask(),
    fromTaskSagas.watchAssignWorker(),
  ]);
}
