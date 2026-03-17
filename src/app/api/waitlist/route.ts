import { NextRequest, NextResponse } from "next/server";

const LOOPS_API_KEY = process.env.LOOPS_API_KEY || "";
const ZEPTOMAIL_TOKEN = process.env.ZEPTOMAIL_TOKEN || "";
const ZEPTOMAIL_FROM = process.env.ZEPTOMAIL_FROM || "";
const COUNT_BASE = 847;

// ─── Supabase REST API ────────────────────────────────────────────────────────
const SUPABASE_URL = "https://qaykvqiytuaxcecfmpgf.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

async function saveToDatabase(
  email: string,
  fullName: string,
  firstName: string,
  instagram: string,
  tiktok: string,
  followers: string,
  category: string
): Promise<boolean> {
  if (!SUPABASE_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist_signups`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        email, full_name: fullName, first_name: firstName,
        instagram, tiktok, followers, category,
      }),
    });
    return res.status === 201;
  } catch (err) {
    console.error("DB insert failed:", err);
    return false;
  }
}

// ─── In-memory rate limit store ───────────────────────────────────────────────
const ipStore = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_IP = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipStore.get(ip);
  if (!entry || now > entry.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_PER_IP) return false;
  entry.count++;
  return true;
}

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

async function addToLoopsContact(
  email: string,
  fullName: string,
  instagramHandle: string,
  tiktokHandle: string,
  followers: string,
  category: string
): Promise<boolean> {
  if (!LOOPS_API_KEY) return false;
  try {
    const [firstName, ...rest] = fullName.trim().split(" ");
    const res = await fetch("https://app.loops.so/api/v1/contacts/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName: rest.join(" ") || undefined,
        source: "leaky-waitlist",
        userGroup: "waitlist",
        instagramHandle,
        tiktokHandle: tiktokHandle || undefined,
        followers,
        category,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendConfirmationEmail(
  email: string,
  firstName: string,
  instagramHandle: string
) {
  if (!ZEPTOMAIL_TOKEN || !ZEPTOMAIL_FROM) return;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>You're on the Leaky waitlist</title>
</head>
<body style="margin:0;padding:0;background:#07070F;font-family:'Epilogue',Arial,sans-serif;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your spot is confirmed. We'll email you 48 hours before your batch opens.&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070F;padding:48px 16px 64px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#0D0D1A;border-radius:20px;overflow:hidden;max-width:560px;width:100%;border:1px solid #1A1A2E;">

        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 28px;text-align:center;border-bottom:1px solid #1A1A2E;">
            <span style="font-size:26px;font-weight:900;color:#00CDB4;letter-spacing:0.06em;font-family:Arial,sans-serif;text-transform:uppercase;">LEAKY</span>
            <div style="margin-top:6px;font-size:11px;color:#4A4A6A;letter-spacing:0.12em;text-transform:uppercase;">Waitlist Confirmed</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 0;">
            <div style="display:inline-block;background:rgba(0,205,180,0.10);border:1px solid rgba(0,205,180,0.25);border-radius:100px;padding:6px 16px;margin-bottom:24px;">
              <span style="font-size:11px;font-weight:700;color:#00CDB4;letter-spacing:0.1em;text-transform:uppercase;">● Spot secured</span>
            </div>
            <h1 style="margin:0 0 16px;font-size:32px;font-weight:900;color:#EDEDFF;line-height:1.2;letter-spacing:-0.01em;font-family:Arial,sans-serif;">
              You're in, ${firstName}.
            </h1>
            <p style="margin:0;font-size:16px;color:#7A7A9E;line-height:1.75;">
              Your spot on the Leaky waitlist is confirmed. We're going through applications in batches, so you'll hear from us 48 hours before your batch opens.
            </p>
          </td>
        </tr>

        <!-- What happens next -->
        <tr>
          <td style="padding:28px 40px 0;">
            <div style="background:rgba(0,205,180,0.06);border:1px solid rgba(0,205,180,0.15);border-radius:14px;padding:24px 28px;">
              <p style="margin:0 0 18px;font-size:11px;font-weight:700;color:#00CDB4;text-transform:uppercase;letter-spacing:0.12em;">What happens next</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:10px 0;border-bottom:1px solid #1A1A2E;">
                  <span style="font-size:13px;color:#00CDB4;font-weight:800;margin-right:14px;font-family:Arial,sans-serif;">01</span>
                  <span style="font-size:14px;color:#7A7A9E;">We review your application</span>
                </td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #1A1A2E;">
                  <span style="font-size:13px;color:#00CDB4;font-weight:800;margin-right:14px;font-family:Arial,sans-serif;">02</span>
                  <span style="font-size:14px;color:#7A7A9E;">You get an email 48h before your batch opens</span>
                </td></tr>
                <tr><td style="padding:10px 0;">
                  <span style="font-size:13px;color:#00CDB4;font-weight:800;margin-right:14px;font-family:Arial,sans-serif;">03</span>
                  <span style="font-size:14px;color:#7A7A9E;">Set your prices, accept your first request</span>
                </td></tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- Social proof -->
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0;font-size:13px;color:#4A4A6A;line-height:1.7;">
              847+ creators are already on the list. We keep batches small so the platform stays high-quality for everyone.
            </p>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:32px 40px 40px;text-align:center;">
            <a href="https://leaky.buzz"
              style="display:inline-block;background:#F0A500;color:#07070F;font-size:15px;font-weight:800;text-decoration:none;padding:14px 40px;border-radius:100px;font-family:Arial,sans-serif;letter-spacing:0.02em;">
              You're on the list
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #1A1A2E;text-align:center;">
            <p style="margin:0;font-size:12px;color:#4A4A6A;line-height:1.8;">
              © 2026 Leaky · welcome@leaky.buzz<br>
              You received this because ${instagramHandle} joined the waitlist at leaky.buzz.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: {
        Authorization: `Zoho-enczapikey ${ZEPTOMAIL_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from: { address: ZEPTOMAIL_FROM, name: "Leaky" },
        to: [{ email_address: { address: email, name: firstName } }],
        subject: `You're on the Leaky waitlist, ${firstName} ✓`,
        htmlbody: html,
      }),
    });
  } catch {}
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
      website,
      _gotcha,
      formLoadedAt,
    } = body;

    // ── Honeypot check ──
    if (website || _gotcha) {
      return NextResponse.json({ success: true, count: COUNT_BASE });
    }

    // ── Timing check (bot speed < 3s) ──
    if (formLoadedAt) {
      const elapsed = Date.now() - Number(formLoadedAt);
      if (elapsed < 3000) {
        return NextResponse.json({ success: true, count: COUNT_BASE });
      }
    }

    // ── Field length limits ──
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

    const tiktok = tiktokHandle
      ? sanitize(tiktokHandle).startsWith("@")
        ? sanitize(tiktokHandle)
        : `@${sanitize(tiktokHandle)}`
      : "";

    const cleanName = sanitize(fullName);
    const firstName = cleanName.split(" ")[0];

    const [dbResult] = await Promise.allSettled([
      saveToDatabase(sanitize(email), cleanName, firstName, handle, tiktok, followers, category),
      addToLoopsContact(sanitize(email), cleanName, handle, tiktok, followers, category),
      sendConfirmationEmail(sanitize(email), firstName, handle),
    ]);

    const saved = dbResult.status === "fulfilled" && dbResult.value === true;
    return NextResponse.json({ success: true, saved, count: COUNT_BASE });
  } catch {
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ count: COUNT_BASE });
}
