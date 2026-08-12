import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const localProxyRoute = () => ({
  target: 'http://localhost:8787',
  changeOrigin: true,
  // The preview/dev server is the trusted same-origin boundary. Normalize a
  // browser or temporary HTTPS-tunnel Origin before forwarding to the
  // localhost-only API so random TryCloudflare hostnames do not need to be
  // added to ALLOWED_ORIGINS.
  headers: { Origin: 'http://localhost:5173' },
});

export const localApiProxy = {
  '/api': localProxyRoute(),
  '/health': localProxyRoute(),
};

export const parsePreviewAllowedHosts = (value = '') => (
  value
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter((host) => (
      host.length > 0
      && host.length <= 253
      && !host.includes('://')
      && !host.includes('/')
      && /^[a-z0-9.-]+$/.test(host)
    ))
);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: localApiProxy,
    },
    preview: {
      // Keep Vite's host validation enabled. Temporary tunnel hostnames belong
      // in the server-only .env.local file rather than in committed source.
      allowedHosts: parsePreviewAllowedHosts(env.GRIMOIRE_PREVIEW_ALLOWED_HOSTS),
      proxy: localApiProxy,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
