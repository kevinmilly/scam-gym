import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DrillProvider } from "@/lib/DrillContext";
import SlowModeInit from "@/lib/SlowModeInit";

export const metadata: Metadata = {
  title: "Scam Gym",
  description: "Train your scam detection. Track your weak spots.",
  manifest: "/manifest.json",
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
        <DrillProvider>
          <main className="min-h-dvh max-w-lg mx-auto">
            {children}
          </main>
        </DrillProvider>
      </body>
    </html>
  );
}
