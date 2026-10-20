import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { rootStore } from './stores';
import Index from './pages/Index';
import { BrowserRouter } from 'react-router';
import Config from './lib/Config';

createRoot(document.getElementById('react') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={rootStore}>
      <BrowserRouter basename={Config.rootDirectory}>
        {/* Index page only */}
        <Index />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
