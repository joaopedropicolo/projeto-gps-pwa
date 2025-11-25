self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("gps-cache").then(cache => {
      return cache.addAll(["/", "/index.html", "/main.js", "/style.css"]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
