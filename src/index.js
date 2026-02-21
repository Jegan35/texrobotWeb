import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // Make sure you have your CSS file imported here!

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);