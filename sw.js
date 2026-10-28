// sw.js — WebCam DMS v5.0.0 (reemplaza a sw_v1.js de la v4.7)
// Red primero para todo: la app necesita internet para transmitir y para ver.
// La caché solo sirve para que abra la pantalla (y muestre "sin conexión") si no hay red.
// Nunca se cachean Supabase, el clima ni las fuentes de otros sitios.
const CACHE = 'webcam-v5.0.0';
const BASE = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))   // borra la caché de la v4.7
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;            // Supabase, CDN, clima: directo a la red
  e.respondWith(
    fetch(req).then(r => {
      if (r && r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {}); }
      return r;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
