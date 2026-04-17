import type { Channel } from "./types";

const ALERTS_KEY = "scamgym_alerts";
const DEBOUNCE_MS = 800;

let lastFireAt = 0;
let audioCtx: AudioContext | null = null;

export function isAlertsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const val = localStorage.getItem(ALERTS_KEY);
  return val === null || val === "1"; // default ON
}

export function setAlertsEnabled(enabled: boolean): void {
  localStorage.setItem(ALERTS_KEY, enabled ? "1" : "0");
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audioCtx = new Ctor();
    } catch {
      return null;
    }
  }
  // Browsers suspend the context until a user gesture; this resume is a no-op
  // if already running and silently fails otherwise.
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function beep(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = "sine",
  peakGain = 0.12,
) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(env);
  env.connect(ctx.destination);
  const t0 = ctx.currentTime + startOffset;
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(peakGain, t0 + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function playSms(ctx: AudioContext) {
  // Two-tone rising tritone — classic SMS feel
  beep(ctx, 784, 0, 0.12, "sine", 0.14);    // G5
  beep(ctx, 1047, 0.09, 0.22, "sine", 0.14); // C6
}

function playEmail(ctx: AudioContext) {
  // Single soft ding — like a desktop mail notification
  beep(ctx, 988, 0, 0.28, "sine", 0.1);      // B5 decaying
  beep(ctx, 1319, 0.005, 0.25, "sine", 0.06); // E6 shimmer layer
}

function playDm(ctx: AudioContext) {
  // Quick ascending pop — chat/DM feel
  beep(ctx, 660, 0, 0.07, "triangle", 0.12);   // E5
  beep(ctx, 988, 0.055, 0.11, "triangle", 0.12); // B5
}

function playPhone(ctx: AudioContext) {
  // Short, restrained ring — not a full ringtone (would be jarring)
  beep(ctx, 440, 0, 0.09, "sine", 0.1);
  beep(ctx, 480, 0.06, 0.12, "sine", 0.1);
}

function playArrivalSound(channel: Channel): void {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    switch (channel) {
      case "sms":   playSms(ctx); break;
      case "email": playEmail(ctx); break;
      case "dm":    playDm(ctx); break;
      case "phone": playPhone(ctx); break;
    }
  } catch {
    // Audio failure is non-critical
  }
}

function arrivalBuzz(channel: Channel): void {
  if (!navigator.vibrate) return;
  try {
    switch (channel) {
      case "sms":   navigator.vibrate(20); break;
      case "email": navigator.vibrate(12); break;
      case "dm":    navigator.vibrate([12, 40, 12]); break;
      case "phone": navigator.vibrate(30); break;
    }
  } catch {
    // vibrate can throw on some browsers if not triggered by gesture — ignore
  }
}

/** CSS class applied to the drill message wrapper for an entrance animation. */
export function arrivalAnimationClass(channel: Channel): string {
  switch (channel) {
    case "sms":   return "drill-arrival-sms";
    case "email": return "drill-arrival-email";
    case "dm":    return "drill-arrival-dm";
    case "phone": return "drill-arrival-phone";
  }
}

/**
 * Fire haptic + sound when a new drill appears. Debounced so rapid-fire
 * navigation (e.g. auto-advancing) doesn't stack buzzes.
 */
export function fireDrillArrival(channel: Channel): void {
  if (!isAlertsEnabled()) return;
  const now = Date.now();
  if (now - lastFireAt < DEBOUNCE_MS) return;
  lastFireAt = now;

  // Respect prefers-reduced-motion for vibration (accessibility: motion
  // sensitivity often pairs with haptic sensitivity).
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) arrivalBuzz(channel);

  playArrivalSound(channel);
}
