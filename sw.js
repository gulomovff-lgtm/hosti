/* Hosti standalone — офлайн-оболочка (сборка efdf61e91a) */
const CACHE = 'hosti-standalone-efdf61e91a';
const ASSETS = ['./', './index.html', './app.js', './manifest.webmanifest', './fonts/fonts.css', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;           // чужие домены воркер не трогает
  const shell = url.pathname === '/' || /\/(index\.html|app\.js)$/.test(url.pathname);
  if (shell) {                                           // оболочка: сеть впереди
    e.respondWith(fetch(e.request).then((res) => {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).catch(() => caches.match('./index.html'))));
});
