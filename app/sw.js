/* Darou Rahmane Chicken — service worker (coque hors ligne) */
const CACHE = 'drc-app-202611221007';
const SHELL = ['./', './index.html', './manifest.json',
  './assets/img/logo.png', './assets/img/p1.webp', './assets/img/p2.webp', './assets/img/p3.webp',
  './assets/img/p4.webp', './assets/img/p5.webp', './assets/img/p8.webp', './assets/img/p9.webp',
  './assets/img/cat-tout.webp', './assets/img/cat-entier.webp', './assets/img/cat-blancs.webp',
  './assets/img/cat-cuisses.webp', './assets/img/cat-abats.webp', './assets/img/cat-oeufs.webp',
  './assets/img/hero1.webp', './assets/img/hero2.webp', './assets/img/hero3.webp',
  './assets/fonts/pjs-400.woff2', './assets/fonts/pjs-500.woff2', './assets/fonts/pjs-600.woff2',
  './assets/fonts/pjs-700.woff2', './assets/fonts/pjs-800.woff2',
  './assets/leaflet/leaflet.js', './assets/leaflet/leaflet.css'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;        /* API et tuiles : réseau direct */
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r;
  }).catch(() => hit)));
});
