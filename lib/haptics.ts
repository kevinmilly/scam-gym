/** Gentle 10ms vibration for button taps. No-op on unsupported devices. */
export function tap() {
  navigator.vibrate?.(10);
}

/** 50ms vibration for medal unlocks. */
export function medalVibrate() {
  navigator.vibrate?.(50);
}

/** 100ms vibration for level-ups. */
export function levelUpVibrate() {
  navigator.vibrate?.(100);
}
