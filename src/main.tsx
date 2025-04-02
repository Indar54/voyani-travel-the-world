
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add custom styles for Voyani theme
const style = document.createElement('style');
style.textContent = `
  :root {
    --voyani-primary: #9b87f5;
    --voyani-secondary: #7E69AB;
    --voyani-tertiary: #6E59A5;
    --voyani-dark: #1A1F2C;
    --voyani-light: #D6BCFA;
  }

  .text-gradient {
    background: linear-gradient(90deg, var(--voyani-primary), var(--voyani-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .neo-blur {
    background: rgba(26, 31, 44, 0.85);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(110, 89, 165, 0.2);
  }

  .dark-pattern {
    background-color: var(--voyani-dark);
    background-image: 
      radial-gradient(rgba(155, 135, 245, 0.08) 1px, transparent 1px),
      radial-gradient(rgba(155, 135, 245, 0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    background-position: 0 0, 10px 10px;
  }
`;
document.head.appendChild(style);

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
