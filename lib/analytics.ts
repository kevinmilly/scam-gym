import posthog from "posthog-js";
import { isPremium } from "./premium";

/** Capture an analytics event with common properties */
export function track(event: string, properties?: Record<string, unknown>) {
  try {
    posthog.capture(event, {
      isPro: isPremium(),
      ...properties,
    });
  } catch {
    // PostHog not initialized or blocked — silently fail
  }
}

/** Identify a signed-in user so retention + funnels work across devices */
export function identifyUser(uid: string, props?: { email?: string | null; displayName?: string | null }) {
  try {
    posthog.identify(uid, {
      email: props?.email ?? undefined,
      name: props?.displayName ?? undefined,
      isPro: isPremium(),
    });
  } catch {
    // PostHog not initialized
  }
}

/** Reset analytics identity on sign-out so the next user is a distinct profile */
export function resetUser() {
  try {
    posthog.reset();
  } catch {
    // PostHog not initialized
  }
}

/** Opt the user in or out of analytics */
export function setAnalyticsEnabled(enabled: boolean) {
  localStorage.setItem("scamgym_analytics", enabled ? "1" : "0");
  try {
    if (enabled) {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }
  } catch {
    // PostHog not initialized
  }
}

export function isAnalyticsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("scamgym_analytics") !== "0";
}
