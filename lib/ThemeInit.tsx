"use client";

import { useEffect } from "react";

const THEME_KEY = "scamgym_theme";

export function getTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(THEME_KEY) as "dark" | "light") || "dark";
}

export function setTheme(theme: "dark" | "light") {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.dataset.theme = theme;
  // Update theme-color meta tag to match
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#f5f5f7" : "#0a0a0f");
}

export default function ThemeInit() {
  useEffect(() => {
    const theme = getTheme();
    if (theme === "light") {
      document.documentElement.dataset.theme = "light";
    }
    // Sync theme-color meta on init
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f5f5f7" : "#0a0a0f");
  }, []);

  return null;
}
