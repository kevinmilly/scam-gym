import { Capacitor } from "@capacitor/core";

async function nativeImpact(style: "Light" | "Medium" | "Heavy") {
  const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
  await Haptics.impact({ style: ImpactStyle[style] });
}

async function nativeNotification(type: "Success" | "Warning" | "Error") {
  const { Haptics, NotificationType } = await import("@capacitor/haptics");
  await Haptics.notification({ type: NotificationType[type] });
}

/** Gentle tap for button presses. */
export function tap() {
  if (Capacitor.isNativePlatform()) {
    nativeImpact("Light").catch(() => null);
  } else {
    navigator.vibrate?.(10);
  }
}

/** Success notification for correct answers. */
export function correctVibrate() {
  if (Capacitor.isNativePlatform()) {
    nativeNotification("Success").catch(() => null);
  } else {
    navigator.vibrate?.(50);
  }
}

/** Error notification for wrong answers. */
export function wrongVibrate() {
  if (Capacitor.isNativePlatform()) {
    nativeNotification("Warning").catch(() => null);
  } else {
    navigator.vibrate?.([30, 20, 30]);
  }
}

/** Celebratory impact for medal unlocks. */
export function medalVibrate() {
  if (Capacitor.isNativePlatform()) {
    nativeImpact("Heavy").catch(() => null);
  } else {
    navigator.vibrate?.(50);
  }
}

/** Heavy impact for level-ups. */
export function levelUpVibrate() {
  if (Capacitor.isNativePlatform()) {
    nativeImpact("Heavy").catch(() => null);
  } else {
    navigator.vibrate?.(100);
  }
}
