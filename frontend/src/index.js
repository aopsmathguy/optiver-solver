import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { Provider } from 'react-redux';

// Get the root DOM element 
const container = document.getElementById('root');

// Create the root
const root = ReactDOM.createRoot(container);

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);