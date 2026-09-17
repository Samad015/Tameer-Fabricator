import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { Analytics } from "@vercel/analytics/react";
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://tameer-fabricator-backend.onrender.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
);