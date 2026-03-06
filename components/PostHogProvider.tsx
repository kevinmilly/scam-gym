"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useState } from "react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const ANALYTICS_KEY = "scamgym_analytics";

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!POSTHOG_KEY) return;

    // Respect user opt-out
    const optedOut = localStorage.getItem(ANALYTICS_KEY) === "0";

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage",
      opt_out_capturing_by_default: optedOut,
    });

    setReady(true);
  }, []);

  if (!POSTHOG_KEY || !ready) return <>{children}</>;

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
