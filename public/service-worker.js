const CACHE_NAME = 'grimoire-xr-shell-0.11a';
const CORE_SHELL = [
  '/',
  '/vr',
  '/index.html',
  '/manifest.webmanifest',
  '/grimoire-icon.svg',
  '/grimoire-icon-192.png',
  '/grimoire-icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(CORE_SHELL.map(path => cache.add(path)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter(name => name.startsWith('grimoire-xr-shell-') && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

const isProviderRequest = url => url.pathname === '/health'
  || url.pathname.startsWith('/api/')
  || url.pathname.startsWith('/ollama/')
  || url.pathname.startsWith('/comfyui/');

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || isProviderRequest(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
        return response;
      } catch {
        return (await caches.match(request))
          || (await caches.match('/vr'))
          || (await caches.match('/index.html'))
          || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    const network = fetch(request).then(async response => {
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    }).catch(() => null);
    return cached || (await network) || Response.error();
  })());
});
