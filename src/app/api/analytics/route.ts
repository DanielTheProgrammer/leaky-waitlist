import { NextRequest, NextResponse } from "next/server";

// Receives analytics beacons (form abandonment, section timing, etc.)
// Logs structured JSON so every event is visible in Vercel Function Logs.
// When PostHog key is set, events are also captured there via the JS SDK.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, ...props } = body;

    // Structured log — visible in Vercel dashboard under "Logs"
    console.log(
      JSON.stringify({
        type: "analytics",
        event,
        timestamp: new Date().toISOString(),
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
        ua: req.headers.get("user-agent") ?? "",
        ...props,
      })
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

// GET endpoint to retrieve a simple stats summary from logs
// (Extend this with Vercel KV or another DB for persistent counters)
export async function GET() {
  return NextResponse.json({
    message: "Analytics events are stored in PostHog and Vercel Function Logs.",
    posthog_dashboard: "https://app.posthog.com",
    vercel_logs: "https://vercel.com/dashboard → your project → Logs",
  });
}
