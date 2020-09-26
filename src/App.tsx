import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { rootStore } from './stores';
import Index from './pages/Index';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={rootStore}>
      <BrowserRouter>
        {/* Index page only */}
        <Index />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('react')
);
