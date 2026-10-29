import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { rootStore } from './stores';
import Index from './pages/Index';
import { BrowserRouter } from 'react-router';
import Config from './lib/Config';
import ErrorBoundary from './components/ErrorBoundary';
import RenderErrorMessage from './components/RenderErrorMessage';

const container = document.getElementById('react');
if (container === null) throw Error('element #react is not found');

createRoot(container).render(
  <React.StrictMode>
    {/* ルータ外のため、トップへの導線は再読み込みを伴う <a> にする */}
    <ErrorBoundary
      fallback={
        <RenderErrorMessage>
          <a href={Config.rootDirectory + '/'}>トップへ戻る</a>
        </RenderErrorMessage>
      }
    >
      <Provider store={rootStore}>
        <BrowserRouter basename={Config.rootDirectory}>
          {/* Index page only */}
          <Index />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
