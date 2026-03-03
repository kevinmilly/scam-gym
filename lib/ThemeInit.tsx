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
}

export default function ThemeInit() {
  useEffect(() => {
    const theme = getTheme();
    if (theme === "light") {
      document.documentElement.dataset.theme = "light";
    }
  }, []);

  return null;
}
