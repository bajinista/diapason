// Diapasón Armónico — service worker
// Cambia VERSION cada vez que publiques una versión nueva: la app avisará al usuario para actualizar.
const VERSION = 'v1.0.1';
const SHELL_CACHE = `diapason-shell-${VERSION}`;
const FONT_CACHE = 'diapason-fonts';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('diapason-shell-') && k !== SHELL_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fuentes de Google: primero la caché, se guardan la primera vez que hay conexión.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith((async () => {
      const cache = await caches.open(FONT_CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
        return res;
      } catch (e) { return new Response('', { status: 504 }); }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Las otras apps de esta web (por ejemplo /negativa/) tienen su propio service worker.
  const root = new URL('./', self.location).pathname;
  const rest = url.pathname.slice(root.length);
  if (url.pathname.startsWith(root) && rest.includes('/') && !rest.startsWith('icons/')) return;

  // Archivos propios: responde al momento desde la caché y la refresca en segundo plano.
  event.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE);
    const key = req.mode === 'navigate' ? './index.html' : req;
    const cached = await cache.match(key, { ignoreSearch: true });
    const network = fetch(req).then(res => {
      if (res.ok) cache.put(key, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { event.waitUntil(network); return cached; }
    const res = await network;
    return res || new Response('Sin conexión', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
