const CACHE_NAME = 'gramavel-v3';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Instala e faz cache dos assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Remove caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }

    throw new Error('Network and cache both failed');
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
}

// Estratégia: Network First para navegação, JS e CSS; Cache First para imagens estáveis
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições de API, OAuth, terceiros e assets de dev/HMR
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/~oauth') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/src/') ||
    url.searchParams.has('v')
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  const isVersionedAsset =
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname.startsWith('/assets/');

  event.respondWith(isVersionedAsset ? networkFirst(request) : cacheFirst(request));
});