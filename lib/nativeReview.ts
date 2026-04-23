import { Capacitor } from "@capacitor/core";

const REVIEW_STORAGE_KEY = "scamgym_review_requested";
const CORRECT_THRESHOLD = 50;

/**
 * After CORRECT_THRESHOLD correct answers, prompt the user to rate the app.
 * On Android: opens the Play Store in-app review sheet.
 * On web: no-op (web users have no app to rate).
 * Only fires once per install.
 */
export async function maybeRequestReview(correctCount: number) {
  if (!Capacitor.isNativePlatform()) return;
  if (correctCount < CORRECT_THRESHOLD) return;
  if (localStorage.getItem(REVIEW_STORAGE_KEY)) return;

  localStorage.setItem(REVIEW_STORAGE_KEY, "1");

  // Open Play Store page directly — works on all Capacitor versions,
  // no peer-dep issues, and behaves correctly when the store isn't reachable.
  const { App } = await import("@capacitor/app");
  const info = await App.getInfo();
  const url = `market://details?id=${info.id}`;
  window.open(url, "_system");
}
