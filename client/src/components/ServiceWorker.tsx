"use client";

import { useEffect } from "react";

/**
 * Registers the offline service worker (public/sw.js) and hands it the files this page
 * already loaded, so one online visit is enough to run the screening offline.
 * Skipped in development, where Next.js rebuilds files on every change.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        const urls = performance
          .getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((url) => url.includes("/_next/static/"));
        registration.active?.postMessage({ type: "CACHE_URLS", urls: [location.pathname, ...urls] });
      })
      .catch(() => undefined); // an app without offline support still works online
  }, []);

  return null;
}
