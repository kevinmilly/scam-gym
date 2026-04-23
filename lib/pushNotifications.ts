"use client";

import { Capacitor } from "@capacitor/core";

const TOKEN_KEY = "scamgym_push_token";
const PERMISSION_ASKED_KEY = "scamgym_push_permission_asked";

/** Register the device for push notifications and persist the FCM token.
 *  Should be called after the user has completed onboarding (not on first open).
 */
export async function initPushNotifications() {
  if (!Capacitor.isNativePlatform()) return;

  const { PushNotifications } = await import("@capacitor/push-notifications");

  // Check current permission state first
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === "prompt") {
    // Only ask once — if the user denied previously, respect that
    if (localStorage.getItem(PERMISSION_ASKED_KEY)) return;
    localStorage.setItem(PERMISSION_ASKED_KEY, "1");
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== "granted") return;

  await PushNotifications.register();

  // Token received — persist for server-side send
  PushNotifications.addListener("registration", (token) => {
    localStorage.setItem(TOKEN_KEY, token.value);
    // Send token to scamgym.com so the server can schedule daily reminders
    sendTokenToServer(token.value).catch(() => null);
  });

  PushNotifications.addListener("registrationError", () => {
    localStorage.removeItem(TOKEN_KEY);
  });

  // Handle notification tap while app is in background / closed
  PushNotifications.addListener("pushNotificationActionPerformed", () => {
    // Route to drill on any notification tap
    if (typeof window !== "undefined") window.location.href = "/drill";
  });
}

/** Return the stored FCM token, or null if not registered. */
export function getPushToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function sendTokenToServer(token: string) {
  const { apiUrl } = await import("@/lib/apiBase");
  await fetch(apiUrl("/api/push-token"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, platform: Capacitor.getPlatform() }),
  });
}
