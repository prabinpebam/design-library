import './revisions/instrument';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@design-library/core/css/index.css';
import './revisions/revisions.css';
import './data/icons';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

