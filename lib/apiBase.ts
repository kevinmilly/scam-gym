import { Capacitor } from "@capacitor/core";

export const API_BASE = Capacitor.isNativePlatform() ? "https://scamgym.com" : "";
export const apiUrl = (path: string) => `${API_BASE}${path}`;
