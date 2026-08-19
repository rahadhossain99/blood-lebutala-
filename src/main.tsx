// Intercept Google OAuth Callback pathnames instantly for Netlify static frontend compatibility
if (window.location.pathname.startsWith("/auth/callback")) {
  const isNetlify = window.location.hostname.includes("netlify.app");
  const backendBase = isNetlify 
    ? "https://ais-pre-7anhgdwwlcid5d5alee2fw-53511548827.asia-southeast1.run.app" 
    : window.location.origin;
  window.location.href = `${backendBase}/auth/callback${window.location.search}`;
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

