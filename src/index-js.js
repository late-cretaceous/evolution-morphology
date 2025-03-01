/**
 * @module index
 * @description Entry point for the Evolution Morphology Simulator
 */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import './styles.css';

// Render the application
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
