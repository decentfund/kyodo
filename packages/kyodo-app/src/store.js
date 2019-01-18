import { createBrowserHistory } from 'history';
import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from './reducers';
import rootSaga from './rootSaga';
import createSagaMiddleware from 'redux-saga';
import { generateContractsInitialState } from 'drizzle';
import drizzleOptions from './drizzleOptions';

// Redux DevTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

const initialState = {
  contracts: generateContractsInitialState(drizzleOptions),
};

export const history = createBrowserHistory();

const store = createStore(
  createRootReducer(history),
  initialState,
  composeEnhancers(applyMiddleware(routerMiddleware(history), sagaMiddleware)),
);

sagaMiddleware.run(rootSaga);

export default store;
