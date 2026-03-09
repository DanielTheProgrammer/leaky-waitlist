import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || "";
const FROM_EMAIL = "Leaky <notifications@leaky.buzz>";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function addToResendAudience(
  email: string,
  instagramHandle: string,
  followers: string,
  category: string
) {
  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) return;
  await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
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
}

async function sendConfirmationEmail(email: string, instagramHandle: string) {
  if (!RESEND_API_KEY) return;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F7F4;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;max-width:540px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:linear-gradient(135deg,#14B8A6,#06b6d4);padding:36px 40px;text-align:center;">
            <span style="font-size:28px;font-weight:900;color:white;letter-spacing:-0.03em;">LEAKY</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#0F172A;line-height:1.2;">
              You're on the list. 🎉
            </h1>
            <p style="margin:0 0 20px;font-size:16px;color:#475569;line-height:1.7;">
              Hey ${instagramHandle}, welcome to the Leaky waitlist!<br>
              You're one of the first creators to join — that means you're getting the <strong style="color:#14B8A6;">$100 launch bonus</strong> when we go live.
            </p>
            <div style="background:#F0FDF9;border:1px solid #CCFBF1;border-radius:12px;padding:20px 24px;margin:24px 0;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0F766E;text-transform:uppercase;letter-spacing:0.05em;">What happens next</p>
              <ul style="margin:0;padding-left:20px;color:#0F172A;font-size:15px;line-height:2;">
                <li>We'll email you 48h before launch</li>
                <li>Your $100 bonus gets credited on signup</li>
                <li>Set your prices and start accepting requests</li>
              </ul>
            </div>
            <p style="margin:0 0 28px;font-size:15px;color:#64748B;">
              In the meantime, refer a friend and earn an extra $25 per creator who joins from your link.
            </p>
            <p style="margin:0;font-size:13px;color:#94A3B8;">
              You received this because you joined the Leaky waitlist.<br>
              <a href="https://leaky.buzz" style="color:#14B8A6;text-decoration:none;">leaky.buzz</a>
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
      subject: "You're on the Leaky waitlist 🎉 — $100 bonus confirmed",
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, instagramHandle, tiktokHandle, followers, category } = body;

    // Validation
    if (!fullName?.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400 }
      );
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    if (!instagramHandle?.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your Instagram handle." },
        { status: 400 }
      );
    }
    if (!followers) {
      return NextResponse.json(
        { success: false, error: "Please select your follower count." },
        { status: 400 }
      );
    }
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Please select your category." },
        { status: 400 }
      );
    }

    const handle = instagramHandle.startsWith("@")
      ? instagramHandle
      : `@${instagramHandle}`;

    const tiktok = tiktokHandle ? (tiktokHandle.startsWith("@") ? tiktokHandle : `@${tiktokHandle}`) : "";

    // Fire all async operations (don't block on errors)
    await Promise.allSettled([
      addToResendAudience(email, handle, followers, category),
      sendConfirmationEmail(email, handle),
    ]);

    const count = await getWaitlistCount();

    return NextResponse.json({ success: true, count });
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
