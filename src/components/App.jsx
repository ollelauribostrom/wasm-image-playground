import React from 'react';
import { Provider, actions } from '../stores/AppStore';
import ErrorBoundary from './ErrorBoundary';
import Header from './Header';
import { Footer } from './Footer';
import ImageView from './ImageView';
import { Droppable } from './Droppable';
import '../styles/main.css';

export default function App() {
  return (
    <Provider>
      <ErrorBoundary>
        <Header />
        <Droppable
          onDrop={async e => {
            e.preventDefault();
            actions.setLoading(true);
            await actions.upload(e.target.files || e.dataTransfer.files);
          }}
          onDragStart={() => actions.setDragging(true)}
          onDragEnd={() => actions.setDragging(false)}
        >
          <ImageView />
        </Droppable>
        <Footer />
      </ErrorBoundary>
    </Provider>
  );
}
