// Service worker de Armonía Negativa.
// Al publicar cambios, sube el número de VERSION para que la app ofrezca actualizar.
const VERSION = 'v1';
const APP = `negativa-app-${VERSION}`;
const FONTS = 'negativa-fonts';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png'
];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap';

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(APP);
    await c.addAll(SHELL);
    // Intenta dejar las fuentes listas desde la instalación (si no hay red, se guardarán en la próxima visita).
    try {
      const f = await caches.open(FONTS);
      const res = await fetch(FONT_CSS, {mode:'cors'});
      if (res.ok) {
        await f.put(FONT_CSS, res.clone());
        const css = await res.text();
        const urls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)].map(m => m[1]);
        await Promise.all(urls.map(u => fetch(u, {mode:'cors'}).then(r => r.ok && f.put(u, r)).catch(()=>{})));
      }
    } catch(_){}
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('negativa-app-') && k !== APP).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fuentes de Google: caché primero, red en segundo plano.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith((async () => {
      const c = await caches.open(FONTS);
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => null);
      return hit || (await net) || Response.error();
    })());
    return;
  }
  if (url.origin !== location.origin) return;

  // Página: red primero (para tener siempre la última versión), caché si no hay conexión.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const r = await fetch(req);
        const c = await caches.open(APP); c.put('./index.html', r.clone());
        return r;
      } catch(_) {
        return (await caches.match('./index.html', {ignoreSearch:true})) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Resto de archivos propios: caché primero.
  e.respondWith((async () => {
    const hit = await caches.match(req, {ignoreSearch:true});
    if (hit) return hit;
    const r = await fetch(req);
    if (r.ok) { const c = await caches.open(APP); c.put(req, r.clone()); }
    return r;
  })());
});
