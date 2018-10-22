import React from 'react';
import { Provider } from '../store/AppStore';
import ErrorBoundary from './ErrorBoundary';
import Reactor from './Reactor';
import Count from './Count';
import '../styles/main.css';

export default function App() {
  return (
    <Provider>
      <ErrorBoundary>
        <Reactor />
        <Count />
      </ErrorBoundary>
    </Provider>
  );
}
