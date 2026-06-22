import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite dev-server WebSocket/HMR disconnect errors and unhandled rejections
if (typeof window !== 'undefined') {
  const isWebsocketError = (err: any): boolean => {
    if (!err) return false;
    const msg = String(err.message || err.reason || err);
    return (
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('ws://') ||
      msg.includes('wss://')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isWebsocketError(event.reason) || isWebsocketError(event)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      console.debug('Suppressed benign HMR WebSocket rejection:', event.reason);
    }
  });

  window.addEventListener('error', (event) => {
    if (isWebsocketError(event.error) || isWebsocketError(event.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      console.debug('Suppressed benign HMR WebSocket error:', event.message);
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

