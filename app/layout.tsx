import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DrillProvider } from "@/lib/DrillContext";
import SlowModeInit from "@/lib/SlowModeInit";
import ThemeInit from "@/lib/ThemeInit";

export const metadata: Metadata = {
  title: "Scam Gym",
  description: "Train your brain to spot scams before they fool you.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
    <html lang="en">
      <body className="antialiased">
        <SlowModeInit />
        <ThemeInit />
        <DrillProvider>
          <main className="min-h-dvh max-w-lg mx-auto">
            {children}
          </main>
        </DrillProvider>
      </body>
    </html>
  );
}
