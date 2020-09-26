import React from 'react';
import { Provider } from 'react-redux';
import { rootStore } from './stores';

const WrapWithProvider = ({ element }: { element: JSX.Element | JSX.Element[] }): JSX.Element => (
  <React.StrictMode>
    <Provider store={rootStore}>
      {element}
    </Provider>
  </React.StrictMode>
);

export default WrapWithProvider;

