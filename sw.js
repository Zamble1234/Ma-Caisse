// Mode hors ligne : change le numéro de version à chaque mise à jour de l'application
var CACHE = "ma-caisse-v1";
var FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  // Les pubs et sites externes passent par le réseau, sans cache
  if (url.origin !== location.origin || e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (r) {
      return r || fetch(e.request).then(function (net) {
        var copy = net.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return net;
      });
    }).catch(function () { return caches.match("./index.html"); })
  );
});
