import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import '@fontsource/press-start-2p/400.css';
import '@fontsource/vt323/400.css';
import './index.css';
// Keep the critical VR shell styles in the entry stylesheet. Some production
// preview/browser combinations can render the lazy XR module before its
// route-scoped CSS has been applied, collapsing the canvas and control panel.
import './vr/vr.css';

const isVrRoute = window.location.pathname.startsWith('/vr')
  || new URLSearchParams(window.location.search).get('mode') === 'vr';
const RootApp = lazy(() => (isVrRoute ? import('./vr/VrApp.jsx') : import('./App.jsx')));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div className="min-h-dvh bg-black text-red-500 grid place-items-center font-mono">AWAKENING THE GRIMOIRE…</div>}>
      <RootApp />
    </Suspense>
  </React.StrictMode>,
);

if (import.meta.env.PROD && !Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).catch(() => {
      // Offline installation is enhancement-only; the live web application remains usable.
    });
  });
}
