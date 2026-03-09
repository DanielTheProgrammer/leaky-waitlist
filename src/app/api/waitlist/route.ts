import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || "";
const FROM_EMAIL = "Leaky <notifications@leaky.buzz>";

// ─── In-memory rate limit store ───────────────────────────────────────────────
// Tracks submission count per IP. Resets every WINDOW_MS.
// Good enough for serverless (per-instance), combined with honeypot catches 99% of abuse.
const ipStore = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_IP = 3;       // max submissions per IP per window
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipStore.get(ip);
  if (!entry || now > entry.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true; // allowed
  }
  if (entry.count >= MAX_PER_IP) return false; // blocked
  entry.count++;
  return true;
}

// Clean up old entries periodically (prevent memory leak on long-lived instances)
function pruneStore() {
  const now = Date.now();
  for (const [key, val] of ipStore.entries()) {
    if (now > val.resetAt) ipStore.delete(key);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function sanitize(str: string): string {
  return str.trim().slice(0, 200);
}

async function addToResendAudience(
  email: string,
  instagramHandle: string,
  followers: string,
  category: string
): Promise<boolean> {
  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) return false;
  try {
    const res = await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        unsubscribed: false,
        data: { instagramHandle, followers, category },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendConfirmationEmail(email: string, instagramHandle: string) {
  if (!RESEND_API_KEY) return;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#111118;border-radius:20px;overflow:hidden;max-width:540px;width:100%;border:1px solid rgba(255,255,255,0.08);">
        <tr>
          <td style="background:#111118;padding:32px 40px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:24px;font-weight:900;color:#14B8A6;letter-spacing:-0.03em;">LEAKY</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:white;line-height:1.2;">
              You're in. 🎉
            </h1>
            <p style="margin:0 0 20px;font-size:16px;color:#94A3B8;line-height:1.7;">
              Hey ${instagramHandle}, you just secured your spot on the Leaky waitlist.<br>
              Your <strong style="color:#EAB308;">$100 launch bonus</strong> is locked in.
            </p>
            <div style="background:rgba(20,184,166,0.08);border:1px solid rgba(20,184,166,0.2);border-radius:12px;padding:20px 24px;margin:24px 0;">
              <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#14B8A6;text-transform:uppercase;letter-spacing:0.1em;">What happens next</p>
              <ul style="margin:0;padding-left:20px;color:#94A3B8;font-size:15px;line-height:2;">
                <li>We'll email you 48h before launch</li>
                <li>Your $100 bonus gets credited on signup</li>
                <li>Set your prices and start accepting paid requests</li>
              </ul>
            </div>
            <p style="margin:0;font-size:12px;color:#475569;">
              You received this because you joined the Leaky waitlist at leaky.buzz.<br>
              If this wasn't you, ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: "You're on the Leaky waitlist — $100 bonus locked",
      html,
    }),
  });
}

async function getWaitlistCount(): Promise<number> {
  const BASE = 847;
  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) return BASE;
  try {
    const res = await fetch(
      `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
      { headers: { Authorization: `Bearer ${RESEND_API_KEY}` } }
    );
    if (!res.ok) return BASE;
    const data = await res.json();
    return Math.max(BASE, (data?.data?.length ?? 0) + BASE);
  } catch {
    return BASE;
  }
}

// ─── POST /api/waitlist ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    pruneStore();

    // ── IP rate limiting ──
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      fullName,
      email,
      instagramHandle,
      tiktokHandle,
      followers,
      category,
      // honeypot fields — bots fill these, humans don't
      website,
      _gotcha,
      formLoadedAt,
    } = body;

    // ── Honeypot check — silently succeed so bots think they won ──
    if (website || _gotcha) {
      return NextResponse.json({ success: true, count: 847 });
    }

    // ── Timing check — reject if submitted in under 3 seconds (bot speed) ──
    if (formLoadedAt) {
      const elapsed = Date.now() - Number(formLoadedAt);
      if (elapsed < 3000) {
        return NextResponse.json({ success: true, count: 847 }); // silent fake success
      }
    }

    // ── Field length limits (prevent payload abuse) ──
    if (
      (fullName && fullName.length > 100) ||
      (email && email.length > 254) ||
      (instagramHandle && instagramHandle.length > 60) ||
      (tiktokHandle && tiktokHandle.length > 60)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid input." },
        { status: 400 }
      );
    }

    // ── Required field validation ──
    if (!fullName?.trim()) {
      return NextResponse.json({ success: false, error: "Please enter your full name." }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!instagramHandle?.trim()) {
      return NextResponse.json({ success: false, error: "Please enter your Instagram handle." }, { status: 400 });
    }
    if (!followers) {
      return NextResponse.json({ success: false, error: "Please select your follower count." }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ success: false, error: "Please select your category." }, { status: 400 });
    }

    const handle = sanitize(instagramHandle).startsWith("@")
      ? sanitize(instagramHandle)
      : `@${sanitize(instagramHandle)}`;

    const _tiktok = tiktokHandle
      ? sanitize(tiktokHandle).startsWith("@")
        ? sanitize(tiktokHandle)
        : `@${sanitize(tiktokHandle)}`
      : "";

    const [saveResult] = await Promise.allSettled([
      addToResendAudience(sanitize(email), handle, followers, category),
      sendConfirmationEmail(sanitize(email), handle),
    ]);

    const saved = saveResult.status === "fulfilled" && saveResult.value === true;
    const count = await getWaitlistCount();
    return NextResponse.json({ success: true, saved, count });
  } catch {
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const count = await getWaitlistCount();
  return NextResponse.json({ count });
}
