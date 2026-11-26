/**
 * ReaderOps service worker: keeps the app working with no network (D-36).
 *
 * - Pages: network first, falling back to the cached copy when offline.
 * - Static files (/_next/static, icons): cache first. Next.js hashes their names, so a
 *   cached file never goes stale.
 * - The page tells us which files it already loaded (CACHE_URLS), so the very first visit
 *   is enough to work offline afterwards.
 *
 * Bump VERSION to drop old caches after a breaking change.
 */
const VERSION = "v1";
const CACHE = `readerops-${VERSION}`;
const APP_SHELL = ["/test", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_URLS") return;
  const sameOrigin = event.data.urls.filter((url) => new URL(url).origin === self.location.origin);
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(sameOrigin)).catch(() => undefined));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Only our own GET requests; never API calls, which must reach the server or fail visibly.
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) ?? (await cache.match("/test"));
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
  return response;
}
