import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css'; // <-- Required for CSS load
import { Analytics } from "@vercel/analytics/react"
import axios from 'axios';

// System automatically .env se URL uthayega, backup me Render live backend chalega
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://tameer-fabricator-backend.onrender.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
);