/* Quiz Duel service worker: makes the app open, and Raj work, without internet. */
const VERSION = "qd-v1";
const PAGES = ["/", "/study", "/tutor", "/streak", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((c) => Promise.allSettled(PAGES.concat(["/icons/icon-192.png", "/manifest.webmanifest"]).map((u) => c.add(u))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const put = (req, res) => {
  if (res && res.ok && res.type !== "opaqueredirect") caches.open(VERSION).then((c) => c.put(req, res));
  return res;
};

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!sameOrigin && !fonts) return;
  if (sameOrigin && url.pathname.startsWith("/api/")) return; // live data; Raj has his own offline fallback

  // Build files never change once published: cache first.
  if (fonts || url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/hero/")) {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(req, res.clone()) && res)));
    return;
  }

  // Pages: try the network, fall back to the last copy, then the offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => put(req, res.clone()) && res)
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/offline"))),
    );
    return;
  }

  // Everything else: serve what we have, refresh in the background.
  event.respondWith(
    caches.match(req).then((hit) => {
      const live = fetch(req).then((res) => put(req, res.clone()) && res).catch(() => hit);
      return hit || live;
    }),
  );
});
