import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

// Wrap the app in React.StrictMode for development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
