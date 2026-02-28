"use client";
import { useEffect } from "react";
export default function SlowModeInit() {
  useEffect(() => {
    const on = localStorage.getItem("scamgym_slowmode") === "1";
    document.documentElement.dataset.slowMode = on ? "true" : "false";
  }, []);
  return null;
}
