import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { rootStore } from './stores';
import Index from './pages/Index';
import { BrowserRouter, Route } from 'react-router-dom';
import Config from './lib/Config';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={rootStore}>
      <BrowserRouter>
        <Route path={Config.rootDirectory}>
          {/* Index page only */}
          <Index />
        </Route>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('react')
);
