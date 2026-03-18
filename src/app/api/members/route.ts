import { NextRequest, NextResponse } from "next/server";

const ZEPTOMAIL_TOKEN = process.env.ZEPTOMAIL_TOKEN || "";
const ZEPTOMAIL_FROM = process.env.ZEPTOMAIL_FROM || "";

// ─── Supabase REST API ────────────────────────────────────────────────────────
const SUPABASE_URL = "https://qaykvqiytuaxcecfmpgf.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

async function saveToDatabase(
  email: string,
  fullName: string,
  firstName: string,
  instagram: string,
  tiktok: string,
  engagementTarget: string,
): Promise<boolean> {
  if (!SUPABASE_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/member_waitlist_signups`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        email, full_name: fullName, first_name: firstName,
        instagram, tiktok, engagement_target: engagementTarget,
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
const WINDOW_MS = 60 * 60 * 1000;

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

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","temp-mail.org","throwaway.email","yopmail.com",
  "sharklasers.com","grr.la","guerrillamail.info","spam4.me","dispostable.com",
  "maildrop.cc","trashmail.com","trashmail.me","trashmail.net","trash-mail.at",
  "fakeinbox.com","10minutemail.com","tempmail.com","dropmail.me","tempr.email",
  "discard.email","spamgourmet.com","mailnull.com","spamex.com","binkmail.com",
  "mt2014.com","nwytg.com","inboxproxy.com","spamfree24.org","mailtemporary.com",
]);

function isValidEmail(email: string): boolean {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) return false;
  const domain = email.split("@")[1].toLowerCase();
  if (DISPOSABLE_DOMAINS.has(domain)) return false;
  const local = email.split("@")[0];
  if (/^(.)\1{3,}/.test(local)) return false;
  return true;
}

function isValidName(name: string): boolean {
  const trimmed = name.trim();
  if (!/^[a-zA-Z\u00C0-\u024F' -]+$/.test(trimmed)) return false;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.some(w => w.length < 2)) return false;
  const lower = trimmed.toLowerCase();
  const fakes = ["test", "fake", "asdf", "qwerty", "lorem", "ipsum", "admin", "user"];
  if (fakes.some(f => lower.includes(f))) return false;
  return true;
}

function sanitize(str: string): string {
  return str.trim().slice(0, 200);
}

async function sendConfirmationEmail(email: string, firstName: string) {
  if (!ZEPTOMAIL_TOKEN || !ZEPTOMAIL_FROM) return;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>You're on the Leaky list</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Epilogue:wght@400;600;700;800&display=swap');
</style>
</head>
<body style="margin:0;padding:0;background:#07070F;font-family:'Epilogue',Arial,sans-serif;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your spot is secured. We'll let you know as soon as member spots open.&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070F;padding:48px 16px 64px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#0D0D1A;border-radius:20px;overflow:hidden;max-width:560px;width:100%;border:1px solid #1A1A2E;">

        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 28px;text-align:center;border-bottom:1px solid #1A1A2E;">
            <span style="font-size:26px;font-weight:900;color:#F0A500;letter-spacing:0.06em;font-family:'Syne',Arial,sans-serif;text-transform:uppercase;">LEAKY</span>
            <div style="margin-top:6px;font-size:11px;color:#4A4A6A;letter-spacing:0.12em;text-transform:uppercase;font-family:'Epilogue',Arial,sans-serif;">Early Access Confirmed</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 0;">
            <div style="display:inline-block;background:rgba(240,165,0,0.10);border:1px solid rgba(240,165,0,0.25);border-radius:100px;padding:6px 16px;margin-bottom:24px;">
              <span style="font-size:11px;font-weight:700;color:#F0A500;letter-spacing:0.1em;text-transform:uppercase;font-family:'Epilogue',Arial,sans-serif;">● Spot secured</span>
            </div>
            <h1 style="margin:0 0 16px;font-size:32px;font-weight:900;color:#EDEDFF;line-height:1.2;letter-spacing:-0.01em;font-family:'Syne',Arial,sans-serif;">
              You're in, ${firstName}.
            </h1>
            <p style="margin:0;font-size:16px;color:#7A7A9E;line-height:1.75;font-family:'Epilogue',Arial,sans-serif;">
              You're now on the early access list for Leaky. We'll let you know as soon as member spots open so you can start making requests.
            </p>
          </td>
        </tr>

        <!-- What happens next -->
        <tr>
          <td style="padding:28px 40px 0;">
            <div style="background:rgba(240,165,0,0.06);border:1px solid rgba(240,165,0,0.15);border-radius:14px;padding:24px 28px;">
              <p style="margin:0 0 18px;font-size:11px;font-weight:700;color:#F0A500;text-transform:uppercase;letter-spacing:0.12em;font-family:'Epilogue',Arial,sans-serif;">What happens next</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:10px 0;border-bottom:1px solid #1A1A2E;">
                  <span style="font-size:13px;color:#F0A500;font-weight:800;margin-right:14px;font-family:'Syne',Arial,sans-serif;">01</span>
                  <span style="font-size:14px;color:#7A7A9E;font-family:'Epilogue',Arial,sans-serif;">We review the early access list</span>
                </td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #1A1A2E;">
                  <span style="font-size:13px;color:#F0A500;font-weight:800;margin-right:14px;font-family:'Syne',Arial,sans-serif;">02</span>
                  <span style="font-size:14px;color:#7A7A9E;font-family:'Epilogue',Arial,sans-serif;">You get notified 48h before spots open</span>
                </td></tr>
                <tr><td style="padding:10px 0;">
                  <span style="font-size:13px;color:#F0A500;font-weight:800;margin-right:14px;font-family:'Syne',Arial,sans-serif;">03</span>
                  <span style="font-size:14px;color:#7A7A9E;font-family:'Epilogue',Arial,sans-serif;">Make your first request to a creator</span>
                </td></tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:32px 40px 40px;text-align:center;">
            <a href="https://leaky.buzz"
              style="display:inline-block;background:#F0A500;color:#07070F;font-size:15px;font-weight:800;text-decoration:none;padding:14px 40px;border-radius:100px;font-family:'Epilogue',Arial,sans-serif;letter-spacing:0.02em;">
              You're on the list
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #1A1A2E;text-align:center;">
            <p style="margin:0;font-size:12px;color:#4A4A6A;line-height:1.8;font-family:'Epilogue',Arial,sans-serif;">
              © 2026 Leaky · welcome@leaky.buzz<br>
              You received this because you joined the member waitlist at leaky.buzz.
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
        subject: `You're on the Leaky list, ${firstName} 🖤`,
        htmlbody: html,
      }),
    });
  } catch {}
}

// ─── POST /api/members ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    pruneStore();

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
      engagementTarget,
      website,
      _gotcha,
      formLoadedAt,
    } = body;

    // ── Honeypot check ──
    if (website || _gotcha) {
      return NextResponse.json({ success: true });
    }

    // ── Timing check (bot speed < 3s) ──
    if (formLoadedAt) {
      const elapsed = Date.now() - Number(formLoadedAt);
      if (elapsed < 3000) {
        return NextResponse.json({ success: true });
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
    if (!fullName?.trim() || !isValidName(fullName)) {
      return NextResponse.json({ success: false, error: "Please enter your real first and last name." }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Please use a real, permanent email address." }, { status: 400 });
    }

    const handle = instagramHandle?.trim()
      ? sanitize(instagramHandle).startsWith("@")
        ? sanitize(instagramHandle)
        : `@${sanitize(instagramHandle)}`
      : "";

    const tiktok = tiktokHandle?.trim()
      ? sanitize(tiktokHandle).startsWith("@")
        ? sanitize(tiktokHandle)
        : `@${sanitize(tiktokHandle)}`
      : "";

    const cleanName = sanitize(fullName);
    const firstName = cleanName.split(" ")[0];

    const cleanTarget = typeof engagementTarget === "string" ? sanitize(engagementTarget) : "";

    const [dbResult] = await Promise.allSettled([
      saveToDatabase(sanitize(email), cleanName, firstName, handle, tiktok, cleanTarget),
      sendConfirmationEmail(sanitize(email), firstName),
    ]);

    const saved = dbResult.status === "fulfilled" && dbResult.value === true;
    return NextResponse.json({ success: true, saved });
  } catch {
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
