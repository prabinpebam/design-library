import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@design-library/core/css/index.css';
import './look';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
