"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

// Initialize at module level — runs when the client bundle loads,
// before any React component mounts. This ensures posthog.capture()
// calls in child useEffects always hit an initialized instance.
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: { password: true },
    },
    persistence: "localStorage",
  });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
