self.addEventListener("install", function(e) {
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function(e) {
  // Offline por defecto: no interceptamos la red, dejamos que el navegador haga lo suyo.
  // El repo ya es offline-first y no requiere SW para funcionar, esto es solo
  // para cumplir con los requisitos de instalabilidad (PWA).
  e.respondWith(fetch(e.request));
});
