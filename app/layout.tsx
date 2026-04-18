import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DrillProvider } from "@/lib/DrillContext";
import SlowModeInit from "@/lib/SlowModeInit";
import ThemeInit from "@/lib/ThemeInit";
import PostHogProvider from "@/components/PostHogProvider";
import ServiceWorkerRegistration from "@/lib/ServiceWorkerRegistration";
import InstallPrompt from "@/components/InstallPrompt";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Scam Gym",
  description: "Train your brain to spot scams before they fool you.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Scam Gym",
  },
  openGraph: {
    title: "Scam Gym",
    description: "Train your brain to spot scams before they fool you.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scam Gym",
    description: "Train your brain to spot scams before they fool you.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ colorScheme: "dark light" }}>
      <body className="antialiased">
        <SlowModeInit />
        <ThemeInit />
        <ServiceWorkerRegistration />
        <PostHogProvider>
          <DrillProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-white focus:rounded-md focus:top-2 focus:left-2">
              Skip to content
            </a>
            <main id="main-content" className="min-h-dvh max-w-lg mx-auto pb-20">
              {children}
            </main>
            <BottomNav />
            <InstallPrompt />
          </DrillProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
