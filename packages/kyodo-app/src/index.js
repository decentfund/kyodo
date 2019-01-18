import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { DrizzleContext } from 'drizzle-react';
import Metamask from './components/Metamask';

import { history, drizzle } from './store';

ReactDOM.render(
  <DrizzleContext.Provider drizzle={drizzle}>
    <Provider store={drizzle.store}>
      <IntlProvider locale="en">
        <Metamask requiredNetwork={['rinkeby', 'private', 'development']}>
          <App history={history} />
        </Metamask>
      </IntlProvider>
    </Provider>
  </DrizzleContext.Provider>,
  document.getElementById('root'),
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
