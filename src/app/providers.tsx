"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return; // gracefully skip if no key configured
    posthog.init(key, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      capture_pageview: true,
      capture_pageleave: true,      // tracks time on page automatically
      autocapture: false,           // we'll track manually for precision
      session_recording: {
        maskAllInputs: false,        // record form inputs (they're not sensitive pre-submit)
        maskInputOptions: {
          password: true,            // mask passwords only
        },
      },
      persistence: "localStorage",
    });
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
