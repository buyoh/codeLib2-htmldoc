import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { rootStore } from './stores';
import Index from './containers/Index';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={rootStore}>
      <Index />
    </Provider>
  </React.StrictMode>,
  document.getElementById('react')
);
