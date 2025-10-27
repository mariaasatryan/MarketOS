import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/animations.css';

// Инициализируем автоматическую синхронизацию только в браузере
if (typeof window !== 'undefined') {
  import('./services/autoSyncService');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
