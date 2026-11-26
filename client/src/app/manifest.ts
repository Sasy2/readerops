import type { MetadataRoute } from "next";

/**
 * Web app manifest (D-02): makes ReaderOps installable on the distributor's phone.
 * It opens straight into the screening for now, since that is the only feature.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReaderOps",
    short_name: "ReaderOps",
    description: "Near vision screening and reading glasses for Eyecon distributors.",
    id: "/",
    start_url: "/test",
    scope: "/",
    display: "standalone",
    orientation: "portrait", // S-12
    background_color: "#f2f2f7",
    theme_color: "#f2f2f7",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // The E sits inside the central safe zone, so the same image works when Android crops it.
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
