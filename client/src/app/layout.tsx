import type { Metadata, Viewport } from "next";
import { ServiceWorker } from "@/components/ServiceWorker";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReaderOps",
  description: "Near vision screening and reading glasses for Eyecon distributors.",
  // iPhone "Add to Home Screen": open as an app, with our icon and name.
  appleWebApp: { capable: true, title: "ReaderOps", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png", icon: "/icons/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#f2f2f7",
  width: "device-width",
  initialScale: 1,
  // Draw under the notch and home bar; ScreenFrame pads with the safe-area insets.
  viewportFit: "cover",
};

/** Uses the phone's system font (San Francisco on iPhone, Roboto on Android): iOS style, nothing to download. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
