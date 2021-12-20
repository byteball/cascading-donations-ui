import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import "antd/dist/antd.less";
import { HelmetProvider } from 'react-helmet-async';
import { PersistGate } from 'redux-persist/integration/react';
import { Spin } from 'antd';
import ReactGA from "react-ga";

import './index.css';
import { store, persistor } from './store';
import * as serviceWorker from './serviceWorker';
import { AppRouter } from 'AppRouter';
import config from 'config';

if (config.GA_id) {
  ReactGA.initialize(config.GA_id);
}

ReactDOM.render(
  <Provider store={store}>
    <HelmetProvider>
      <PersistGate loading={<Spin size="large" />} persistor={persistor}>
        <AppRouter />
      </PersistGate>
    </HelmetProvider>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
