// Gramável Service Worker
// Strategy:
// - HTML/navigation: network-first with 3s timeout, fallback to cached shell, then offline.html
// - Versioned assets (/assets/*-[hash].*): cache-first (immutable, persistent across deploys)
// - Images: stale-while-revalidate (TTL 7 days, max 60, persistent across deploys)
// - Other GET same-origin: network-first with cache fallback
// - Skip everything else (APIs, third-party, OAuth, dev assets)

const VERSION = 'gramavel-v6-2026-04-25';

// Shell cache is versioned — replaced on every deploy so the latest HTML wins
const SHELL_CACHE = `gramavel-shell-${VERSION}`;
// Asset/image caches are persistent — never blown away on deploy.
// Hashed asset filenames already guarantee freshness; images age via TTL.
const ASSET_CACHE = 'gramavel-assets-v1';
const IMAGE_CACHE = 'gramavel-images-v1';

const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

const NAV_TIMEOUT_MS = 3000;
const IMAGE_MAX_ENTRIES = 60;
const IMAGE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// ---------- Install ----------
self.addEventListener('install', (event) => {
  console.log('[SW] install', VERSION);
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // Use individual puts so a single failure doesn't abort the whole install
      Promise.all(
        PRECACHE_URLS.map((url) =>
          fetch(url, { cache: 'reload' })
            .then((res) => {
              if (res && res.ok) return cache.put(url, res);
            })
            .catch(() => {})
        )
      )
    )
  );
  // Don't auto-activate — wait for client SKIP_WAITING message
});

// ---------- Activate ----------
self.addEventListener('activate', (event) => {
  console.log('[SW] activate', VERSION);
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          // Delete only old shell caches; preserve persistent asset/image caches
          .filter((k) => k.startsWith('gramavel-shell-') && k !== SHELL_CACHE)
          .map((k) => caches.delete(k))
      );
      // Also clean up legacy caches from older SW versions
      await Promise.all(
        keys
          .filter(
            (k) =>
              (k.startsWith('gramavel-v') || k.endsWith('-runtime') || k.endsWith('-images') || k.endsWith('-assets')) &&
              k !== SHELL_CACHE &&
              k !== ASSET_CACHE &&
              k !== IMAGE_CACHE &&
              !k.startsWith('gramavel-shell-')
          )
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// ---------- Messages ----------
self.addEventListener('message', (event) => {
  const data = event.data;
  if (data === 'SKIP_WAITING' || data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (data?.type === 'GET_VERSION') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage(VERSION);
    }
    return;
  }
});

// ---------- Helpers ----------
function isCacheableResponse(response) {
  return (
    response &&
    response.status === 200 &&
    (response.type === 'basic' || response.type === 'default')
  );
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const toDelete = keys.length - maxEntries;
  for (let i = 0; i < toDelete; i++) await cache.delete(keys[i]);
}

function timestamped(response) {
  const headers = new Headers(response.headers);
  headers.set('x-sw-cached-at', Date.now().toString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isExpired(response, maxAgeMs) {
  const cachedAt = Number(response.headers.get('x-sw-cached-at') || 0);
  if (!cachedAt) return false;
  return Date.now() - cachedAt > maxAgeMs;
}

// Network-first with timeout for navigation
async function navigationStrategy(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('nav-timeout')), NAV_TIMEOUT_MS)
    );
    const response = await Promise.race([networkPromise, timeoutPromise]);
    if (isCacheableResponse(response)) {
      cache.put(request, response.clone()).catch(() => {});
      // Also keep '/index.html' in sync as the canonical shell fallback
      cache.put('/index.html', response.clone()).catch(() => {});
    }
    return response;
  } catch {
    const cached =
      (await cache.match(request)) ||
      (await cache.match('/index.html')) ||
      (await cache.match('/'));
    if (cached) return cached;
    const fallback = await cache.match(OFFLINE_URL);
    if (fallback) return fallback;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

// Cache-first for immutable hashed assets
async function assetStrategy(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

// Stale-while-revalidate with TTL for images
async function imageStrategy(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (isCacheableResponse(response)) {
        cache.put(request, timestamped(response.clone())).then(() =>
          trimCache(IMAGE_CACHE, IMAGE_MAX_ENTRIES)
        );
      }
      return response;
    })
    .catch(() => null);

  if (cached && !isExpired(cached, IMAGE_MAX_AGE_MS)) {
    fetchPromise.catch(() => {});
    return cached;
  }
  const fresh = await fetchPromise;
  if (fresh) return fresh;
  if (cached) return cached;
  return new Response('', { status: 504 });
}

// Network-first for other same-origin GETs
async function defaultStrategy(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error('offline-no-cache');
  }
}

// ---------- Fetch ----------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip non-same-origin, OAuth, dev/HMR, query-versioned dev assets
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/~oauth') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/@react-refresh') ||
    url.pathname.startsWith('/src/') ||
    url.searchParams.has('v')
  ) {
    return;
  }

  // Navigation requests (HTML)
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(navigationStrategy(request));
    return;
  }

  // Hashed immutable assets from Vite build
  const isHashedAsset = /\/assets\/.+-[A-Za-z0-9_-]{6,}\.(?:js|css|woff2?|ttf|svg)$/.test(
    url.pathname
  );
  if (isHashedAsset) {
    event.respondWith(assetStrategy(request));
    return;
  }

  // Images
  if (
    request.destination === 'image' ||
    /\.(?:png|jpe?g|webp|gif|avif|svg|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(imageStrategy(request));
    return;
  }

  // Fallback for other same-origin GETs
  event.respondWith(defaultStrategy(request));
});
