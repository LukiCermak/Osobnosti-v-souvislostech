import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/assets/styles/tokens.css';
import '@/assets/styles/globals.css';
import '@/assets/styles/layout.css';
import '@/assets/styles/utilities.css';
import { registerServiceWorker } from '@/services/pwa/registerServiceWorker';

registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
