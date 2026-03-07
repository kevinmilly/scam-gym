const AUDIO_KEY = "scamgym_audio";

export function isAudioEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const val = localStorage.getItem(AUDIO_KEY);
  return val === null || val === "1"; // default ON if never set
}

export function setAudioEnabled(enabled: boolean): void {
  localStorage.setItem(AUDIO_KEY, enabled ? "1" : "0");
}

function play(src: string) {
  if (!isAudioEnabled()) return;
  try {
    const audio = new Audio(src);
    audio.volume = 0.5;
    audio.play();
  } catch {
    // Silently fail — audio is non-critical
  }
}

export function playCorrect() {
  play("/sounds/success.mp3");
}

export function playIncorrect() {
  play("/sounds/warning.mp3");
}
