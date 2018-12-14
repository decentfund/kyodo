import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
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
registerServiceWorker();
