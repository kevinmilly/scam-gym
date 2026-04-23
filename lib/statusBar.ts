import { Capacitor } from "@capacitor/core";

/** Set the status bar to match the app's theme. Call on mount and on theme change. */
export async function syncStatusBar(isDark: boolean) {
  if (!Capacitor.isNativePlatform()) return;
  const { StatusBar, Style } = await import("@capacitor/status-bar");
  await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  await StatusBar.setBackgroundColor({
    color: isDark ? "#0a1528" : "#faf7f2",
  });
}
