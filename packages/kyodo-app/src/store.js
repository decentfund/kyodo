import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './reducers';
import rootSaga from './rootSaga';
import createSagaMiddleware from 'redux-saga';
import { Drizzle, generateContractsInitialState } from 'drizzle';
import drizzleOptions from './drizzleOptions';

// Redux DevTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

const initialState = {
  contracts: generateContractsInitialState(drizzleOptions),
};

const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(applyMiddleware(sagaMiddleware)),
);

sagaMiddleware.run(rootSaga);

const drizzle = new Drizzle(drizzleOptions, store);
export { drizzle };

export default store;
