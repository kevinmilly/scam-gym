import { Capacitor } from "@capacitor/core";

export function getPlatform(): "web" | "android" | "ios" {
  if (typeof window === "undefined") return "web";
  const p = Capacitor.getPlatform();
  if (p === "android") return "android";
  if (p === "ios") return "ios";
  return "web";
}

export function isNativeAndroid(): boolean {
  return getPlatform() === "android";
}

export function isNative(): boolean {
  const p = getPlatform();
  return p === "android" || p === "ios";
}

export function isWeb(): boolean {
  return getPlatform() === "web";
}
