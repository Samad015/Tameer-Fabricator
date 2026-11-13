import './shared/api.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App.jsx';
import './styles/index.css';
import { Analytics } from "@vercel/analytics/react";
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const navigation = performance.getEntriesByType('navigation')[0];
if (navigation?.type === 'reload') {
  history.scrollRestoration = 'manual';
  history.replaceState(null, '', '/');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
);
