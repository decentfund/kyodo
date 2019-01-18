import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { DrizzleProvider } from 'drizzle-react';
import Metamask from './components/Metamask';
import drizzleOptions from './drizzleOptions';

import store from './store';

ReactDOM.render(
  <DrizzleProvider options={drizzleOptions} store={store}>
    <IntlProvider locale="en">
      <Metamask requiredNetwork={['rinkeby', 'private', 'development']}>
        <App />
      </Metamask>
    </IntlProvider>
  </DrizzleProvider>,
  document.getElementById('root'),
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
