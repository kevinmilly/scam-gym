"use client";

import { useEffect } from "react";

const THEME_KEY = "scamgym_theme";

export function getTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(THEME_KEY) as "dark" | "light") || "light";
}

export function setTheme(theme: "dark" | "light") {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0a1528" : "#faf7f2");
}

export default function ThemeInit() {
  useEffect(() => {
    const theme = getTheme();
    if (theme === "dark") {
      document.documentElement.dataset.theme = "dark";
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0a1528" : "#faf7f2");
  }, []);

  return null;
}
