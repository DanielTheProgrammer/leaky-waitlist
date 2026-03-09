"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { ArrowRight, ChevronDown, CheckCircle2, Star, Lock, X } from "lucide-react";
import { usePostHog } from "posthog-js/react";

// fbq is injected globally by the Meta Pixel script in layout.tsx
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  fullName: string;
  email: string;
  instagramHandle: string;
  tiktokHandle: string;
  followers: string;
  category: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  instagramHandle?: string;
  followers?: string;
  category?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FOLLOWER_OPTIONS = [
  { value: "2k-10k", label: "2K – 10K" },
  { value: "10k-50k", label: "10K – 50K" },
  { value: "50k-100k", label: "50K – 100K" },
  { value: "100k-500k", label: "100K – 500K" },
  { value: "500k-1m", label: "500K – 1M" },
  { value: "1m+", label: "1M+" },
];

const CATEGORY_OPTIONS = [
  { value: "model-beauty", label: "Model / Beauty" },
  { value: "fitness-wellness", label: "Fitness / Wellness" },
  { value: "entrepreneur-business", label: "Entrepreneur / Business" },
  { value: "creator-influencer", label: "Creator / Influencer" },
  { value: "musician-artist", label: "Musician / Artist" },
  { value: "gamer-streamer", label: "Gamer / Streamer" },
  { value: "coach-educator", label: "Coach / Educator" },
  { value: "other", label: "Other" },
];

// Anonymized ticker items — feel real and specific
const TICKER_ITEMS = [
  { handle: "@s***a", amount: "$247", type: "Story Feature", time: "2h ago" },
  { handle: "@m***k", amount: "$180", type: "Comment", time: "3h ago" },
  { handle: "@j***a", amount: "$420", type: "Post Tag", time: "4h ago" },
  { handle: "@t***r", amount: "$155", type: "Story Mention", time: "5h ago" },
  { handle: "@c***e", amount: "$310", type: "Story Feature", time: "6h ago" },
  { handle: "@l***a", amount: "$195", type: "Comment", time: "7h ago" },
  { handle: "@r***n", amount: "$500", type: "Post Tag", time: "8h ago" },
  { handle: "@v***a", amount: "$220", type: "Story Mention", time: "9h ago" },
  { handle: "@k***i", amount: "$175", type: "Story Feature", time: "11h ago" },
  { handle: "@d***s", amount: "$290", type: "Post Tag", time: "12h ago" },
];

const FAQS = [
  {
    q: "Do I have to accept every request?",
    a: "Never. You see each request before deciding. The fan's payment is already locked — you review the request, the amount, and what they want. Accept only the ones you're comfortable with. Decline the rest with no penalty.",
  },
  {
    q: "What exactly are fans paying for?",
    a: "Authentic engagement from someone they admire. A comment on their post, a story feature, a tag — it's social proof. They look more popular, more connected. You're just being yourself and getting paid for it.",
  },
  {
    q: "How is this different from Cameo or OnlyFans?",
    a: "Cameo requires creating custom video content. OnlyFans requires constant content production. Leaky is just engagement — things you already do on Instagram, but now you get paid. No script. No camera. No content to create.",
  },
  {
    q: "How quickly can I start earning?",
    a: "Setup takes 2 minutes. You set your prices, and requests start coming in. Most early access creators receive their first request within 24–48 hours of joining.",
  },
  {
    q: "Is this ethical?",
    a: "Yes. Fans know exactly what they're getting — authentic engagement from a real creator they admire. You're not deceiving anyone. Fans get social proof, you get paid. It's a transparent transaction.",
  },
  {
    q: "When do I get paid?",
    a: "Every Friday. Earnings are sent directly to your bank account. No minimum payout threshold.",
  },
];

// ─── Phone Animation ──────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    avatar: "https://i.pravatar.cc/48?img=32",
    name: "Marcus T.",
    handle: "@marcus.t",
    type: "Story Feature",
    amount: "$350",
    delay: 0,
  },
  {
    avatar: "https://i.pravatar.cc/48?img=15",
    name: "James R.",
    handle: "@james.r",
    type: "Comment Drop",
    amount: "$180",
    delay: 3000,
  },
  {
    avatar: "https://i.pravatar.cc/48?img=8",
    name: "Ryan K.",
    handle: "@ryan.k",
    type: "Post Tag",
    amount: "$420",
    delay: 6000,
  },
];

function PhoneAnimation() {
  const [activeNotif, setActiveNotif] = useState(-1);
  const [totalEarned, setTotalEarned] = useState(0);
  const [acceptedIdx, setAcceptedIdx] = useState<number[]>([]);
  const earnings = [350, 530, 950];

  useEffect(() => {
    let cancelled = false;

    const runCycle = () => {
      setActiveNotif(-1);
      setTotalEarned(0);
      setAcceptedIdx([]);

      NOTIFICATIONS.forEach((notif, i) => {
        setTimeout(() => {
          if (cancelled) return;
          setActiveNotif(i);
        }, notif.delay + 400);

        // accept after 1.8s
        setTimeout(() => {
          if (cancelled) return;
          setAcceptedIdx((prev) => [...prev, i]);
          setTotalEarned(earnings[i]);
        }, notif.delay + 2200);
      });
    };

    runCycle();
    const interval = setInterval(runCycle, 11000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        width: "240px",
        height: "480px",
        borderRadius: "40px",
        background: "#0F0F14",
        border: "6px solid #1E1E2A",
        boxShadow:
          "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.03)",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Status bar */}
      <div
        style={{
          background: "#0F0F14",
          padding: "12px 20px 6px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: "700", color: "white" }}>9:41</span>
        <div
          style={{
            width: "72px",
            height: "18px",
            borderRadius: "9px",
            background: "#1E1E2A",
          }}
        />
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <rect x="0" y="5" width="2" height="5" rx="1" fill="white" opacity="0.5" />
            <rect x="3" y="3" width="2" height="7" rx="1" fill="white" opacity="0.7" />
            <rect x="6" y="1" width="2" height="9" rx="1" fill="white" opacity="0.9" />
            <rect x="9" y="0" width="2" height="10" rx="1" fill="white" />
          </svg>
        </div>
      </div>

      {/* App header */}
      <div
        style={{
          background: "#0F0F14",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "8px 16px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "15px",
            fontWeight: "900",
            color: "#14B8A6",
            letterSpacing: "-0.02em",
          }}
        >
          LEAKY
        </span>
        <div
          style={{
            background: totalEarned > 0 ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.06)",
            borderRadius: "8px",
            padding: "4px 10px",
            transition: "all 0.4s ease",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: totalEarned > 0 ? "#14B8A6" : "#64748B",
              transition: "color 0.4s ease",
            }}
          >
            {totalEarned > 0 ? `$${totalEarned} earned` : "Requests"}
          </span>
        </div>
      </div>

      {/* Request list */}
      <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {NOTIFICATIONS.map((notif, i) => {
          const isAccepted = acceptedIdx.includes(i);
          const isActive = activeNotif === i && !isAccepted;
          const isPast = acceptedIdx.includes(i);
          return (
            <div
              key={i}
              style={{
                background: isActive
                  ? "rgba(20,184,166,0.12)"
                  : isPast
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${isActive ? "rgba(20,184,166,0.35)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "14px",
                padding: "10px 12px",
                transition: "all 0.35s ease",
                opacity: i > activeNotif + 1 ? 0.3 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Avatar */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#1E1E2A",
                    border: "1.5px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={notif.avatar}
                    alt={notif.name}
                    width={32}
                    height={32}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "white",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {notif.name}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "900",
                        color: "#14B8A6",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {notif.amount}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#64748B",
                      display: "block",
                    }}
                  >
                    {notif.type}
                  </span>
                </div>
              </div>

              {/* Accept/Decline buttons — only show on active */}
              {isActive && (
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginTop: "8px",
                    animation: "fadeIn 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      background: "#14B8A6",
                      borderRadius: "8px",
                      padding: "5px 0",
                      textAlign: "center",
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "white",
                    }}
                  >
                    Accept
                  </div>
                  <div
                    style={{
                      width: "28px",
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: "8px",
                      padding: "5px 0",
                      textAlign: "center",
                      fontSize: "10px",
                      color: "#64748B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={10} />
                  </div>
                </div>
              )}

              {/* Accepted badge */}
              {isAccepted && (
                <div
                  style={{
                    marginTop: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <CheckCircle2 size={10} color="#14B8A6" />
                  <span style={{ fontSize: "9px", color: "#14B8A6", fontWeight: "600" }}>
                    Accepted · {notif.amount} coming Friday
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────

function ActivityTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      style={{
        background: "#0D0D14",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "14px 0",
        overflow: "hidden",
      }}
    >
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 32px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#14B8A6",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: "13px", color: "#94A3B8", fontWeight: "500" }}>
              {item.handle}
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "800",
                color: "#EAB308",
                letterSpacing: "-0.01em",
              }}
            >
              {item.amount}
            </span>
            <span style={{ fontSize: "12px", color: "#475569" }}>
              {item.type} · {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Request Card Mockup ──────────────────────────────────────────────────────

function RequestCardMockup() {
  const [state, setState] = useState<"pending" | "accepted">("pending");

  useEffect(() => {
    const t1 = setTimeout(() => setState("accepted"), 3200);
    const t2 = setTimeout(() => setState("pending"), 6500);
    const t3 = setTimeout(() => setState("accepted"), 9700);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        background: "#111118",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "20px",
        padding: "24px",
        maxWidth: "380px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: "700",
          color: "#64748B",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: "16px",
        }}
      >
        New Request
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.1)",
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://i.pravatar.cc/44?img=11"
            alt="fan"
            width={44}
            height={44}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "white" }}>Carlos M.</div>
          <div style={{ fontSize: "12px", color: "#64748B" }}>@carlos.m · 8.2K followers</div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            background: "rgba(20,184,166,0.12)",
            border: "1px solid rgba(20,184,166,0.25)",
            borderRadius: "10px",
            padding: "6px 14px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "900",
              color: "#14B8A6",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            $350
          </div>
          <div style={{ fontSize: "9px", color: "#64748B", fontWeight: "600" }}>locked in escrow</div>
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: "12px",
          padding: "12px 14px",
          marginBottom: "16px",
          fontSize: "13px",
          color: "#94A3B8",
          lineHeight: "1.6",
        }}
      >
        "Would love a story feature with me tagged. You&apos;re amazing!"
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          fontSize: "12px",
          color: "#475569",
        }}
      >
        <span>Story Feature · Expires in 48h</span>
        <span style={{ color: "#EAB308", fontWeight: "600" }}>$350</span>
      </div>

      {state === "pending" ? (
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: "12px",
              background: "#14B8A6",
              border: "none",
              color: "white",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Accept & Earn $350
          </button>
          <button
            style={{
              width: "44px",
              padding: "12px 0",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#64748B",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            background: "rgba(20,184,166,0.1)",
            border: "1px solid rgba(20,184,166,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeIn 0.4s ease",
          }}
        >
          <CheckCircle2 size={16} color="#14B8A6" />
          <span style={{ fontSize: "13px", color: "#14B8A6", fontWeight: "600" }}>
            Accepted — $350 arrives Friday
          </span>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// ─── Waitlist Form ────────────────────────────────────────────────────────────

function WaitlistForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    instagramHandle: "",
    tiktokHandle: "",
    followers: "",
    category: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedToDb, setSavedToDb] = useState(false);
  const formLoadedAt = useRef(Date.now());
  const posthog = usePostHog();
  const formStarted = useRef(false);
  const formRef = useRef(form); // always up-to-date snapshot for pagehide

  // Keep ref in sync so pagehide always has latest values
  useEffect(() => { formRef.current = form; }, [form]);

  // Send abandonment event when user leaves with partially filled form
  useEffect(() => {
    const handleLeave = () => {
      const f = formRef.current;
      const filledFields = Object.entries(f)
        .filter(([, v]) => v.trim?.() || v)
        .map(([k]) => k);
      if (filledFields.length === 0 || submitted) return;

      const partial = {
        filled_fields: filledFields,
        // Capture what they entered — email + handles are useful for follow-up
        email: f.email || null,
        instagramHandle: f.instagramHandle || null,
        tiktokHandle: f.tiktokHandle || null,
        followers: f.followers || null,
        category: f.category || null,
        // Never capture full name alone — attach only when email present
        fullName: f.email ? (f.fullName || null) : null,
      };

      posthog?.capture("form_abandoned", partial);

      // Also send via beacon so it survives page close
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/analytics",
          JSON.stringify({ event: "form_abandoned", ...partial })
        );
      }
    };

    window.addEventListener("pagehide", handleLeave);
    return () => window.removeEventListener("pagehide", handleLeave);
  }, [posthog, submitted]);

  // Update form state + track per-field analytics
  const updateField = (field: keyof FormData, value: string) => {
    if (!formStarted.current) {
      posthog?.capture("form_started");
      formStarted.current = true;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    if (value) posthog?.capture("form_field_completed", { field });
  };

  const validate2 = (): boolean => {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = "Full name required.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email required.";
    if (!form.instagramHandle.trim()) e.instagramHandle = "Instagram handle required.";
    if (!form.followers) e.followers = "Select follower count.";
    if (!form.category) e.category = "Select your category.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate2()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          website: "",   // honeypot — left empty by humans
          _gotcha: "",   // honeypot — left empty by humans
          formLoadedAt: formLoadedAt.current,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Something went wrong.");
      setSavedToDb(data.saved === true);
      posthog?.capture("form_submitted", {
        saved_to_db: data.saved === true,
        followers: form.followers,
        category: form.category,
      });
      // Fire Meta Pixel Lead event — only after server confirms success
      window.fbq?.("track", "Lead");
      setSubmitted(true);
      setForm({ fullName: "", email: "", instagramHandle: "", tiktokHandle: "", followers: "", category: "" });
      onSuccess();
      toast.success("You're in. Welcome to Leaky.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1.5px solid rgba(255,255,255,0.1)",
    fontSize: "15px",
    color: "white",
    background: "rgba(255,255,255,0.05)",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#64748B",
    marginBottom: "6px",
  };

  const errorStyle: React.CSSProperties = { fontSize: "11px", color: "#EF4444", marginTop: "4px" };

  if (submitted) {
    return (
      <div
        style={{
          background: "#111118",
          borderRadius: "24px",
          padding: "48px 40px",
          border: "1px solid rgba(20,184,166,0.2)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(20,184,166,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <CheckCircle2 size={32} color="#14B8A6" />
        </div>
        <h3
          className="font-outfit"
          style={{ fontSize: "26px", fontWeight: "800", color: "white", marginBottom: "12px", letterSpacing: "-0.02em" }}
        >
          You&apos;re in.
        </h3>
        <p style={{ color: "#64748B", fontSize: "15px", lineHeight: "1.7", marginBottom: "16px" }}>
          We&apos;ll reach out 48h before we open the doors with your early access link.
        </p>
        {/* DB confirmation badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: savedToDb ? "rgba(20,184,166,0.1)" : "rgba(234,179,8,0.08)",
          border: `1px solid ${savedToDb ? "rgba(20,184,166,0.25)" : "rgba(234,179,8,0.2)"}`,
          borderRadius: "10px",
          padding: "8px 14px",
          marginBottom: "20px",
          fontSize: "12px",
          fontWeight: "600",
          color: savedToDb ? "#14B8A6" : "#EAB308",
        }}>
          {savedToDb ? (
            <><CheckCircle2 size={13} color="#14B8A6" /> Spot confirmed &amp; saved</>
          ) : (
            <><span style={{ fontSize: "13px" }}>⏳</span> Spot reserved — check back after Resend is re-activated</>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
          {["Early access", "You approve every request", "Paid every Friday"].map((badge) => (
            <span
              key={badge}
              style={{
                background: "rgba(20,184,166,0.1)",
                color: "#14B8A6",
                border: "1px solid rgba(20,184,166,0.2)",
                borderRadius: "100px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              ✓ {badge}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      id="waitlist-form"
      style={{
        background: "#111118",
        borderRadius: "24px",
        padding: "36px",
        border: "1px solid rgba(255,255,255,0.08)",
        position: "sticky",
        top: "100px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <Lock size={14} color="#EAB308" />
        <span style={{ fontSize: "12px", fontWeight: "700", color: "#EAB308", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Apply for Early Access
        </span>
      </div>
      <p style={{ fontSize: "12px", color: "#475569", marginBottom: "20px", lineHeight: "1.6" }}>
        Requires 2,000+ followers · We welcome all niches and sizes
      </p>

      <h3
        className="font-outfit"
        style={{ fontSize: "22px", fontWeight: "800", color: "white", marginBottom: "6px", letterSpacing: "-0.02em" }}
      >
        Claim your spot
      </h3>
      <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "24px" }}>
        Join 847 creators already inside.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            className="input-field"
            style={{ ...inputStyle, borderColor: errors.fullName ? "#EF4444" : "rgba(255,255,255,0.1)" }}
          />
          {errors.fullName && <p style={errorStyle}>{errors.fullName}</p>}
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="input-field"
            style={{ ...inputStyle, borderColor: errors.email ? "#EF4444" : "rgba(255,255,255,0.1)" }}
          />
          {errors.email && <p style={errorStyle}>{errors.email}</p>}
        </div>

        <div>
          <label style={labelStyle}>Instagram Handle</label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#475569",
                fontSize: "15px",
                pointerEvents: "none",
              }}
            >
              @
            </span>
            <input
              type="text"
              placeholder="yourhandle"
              value={form.instagramHandle.replace(/^@/, "")}
              onChange={(e) => updateField("instagramHandle", e.target.value.replace(/^@/, ""))}
              className="input-field"
              style={{
                ...inputStyle,
                paddingLeft: "30px",
                borderColor: errors.instagramHandle ? "#EF4444" : "rgba(255,255,255,0.1)",
              }}
            />
          </div>
          {errors.instagramHandle && <p style={errorStyle}>{errors.instagramHandle}</p>}
        </div>

        <div>
          <label style={labelStyle}>TikTok Handle <span style={{ color: "#334155", fontWeight: "500", textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#475569",
                fontSize: "15px",
                pointerEvents: "none",
              }}
            >
              @
            </span>
            <input
              type="text"
              placeholder="yourtiktok"
              value={form.tiktokHandle.replace(/^@/, "")}
              onChange={(e) => updateField("tiktokHandle", e.target.value.replace(/^@/, ""))}
              className="input-field"
              style={{ ...inputStyle, paddingLeft: "30px" }}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Follower Count</label>
          <select
            value={form.followers}
            onChange={(e) => updateField("followers", e.target.value)}
            className="input-field"
            style={{
              ...inputStyle,
              cursor: "pointer",
              borderColor: errors.followers ? "#EF4444" : "rgba(255,255,255,0.1)",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
              paddingRight: "40px",
            }}
          >
            <option value="" style={{ background: "#111118" }}>Select follower count…</option>
            {FOLLOWER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ background: "#111118" }}>{o.label}</option>
            ))}
          </select>
          {errors.followers && <p style={errorStyle}>{errors.followers}</p>}
        </div>

        <div>
          <label style={labelStyle}>Category</label>
          <select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="input-field"
            style={{
              ...inputStyle,
              cursor: "pointer",
              borderColor: errors.category ? "#EF4444" : "rgba(255,255,255,0.1)",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
              paddingRight: "40px",
            }}
          >
            <option value="" style={{ background: "#111118" }}>Select your niche…</option>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ background: "#111118" }}>{o.label}</option>
            ))}
          </select>
          {errors.category && <p style={errorStyle}>{errors.category}</p>}
        </div>

        {/* Honeypot fields — hidden from humans, bots fill these */}
        <input type="text" name="website" style={{ display: "none" }} tabIndex={-1} autoComplete="off" readOnly />
        <input type="text" name="_gotcha" style={{ display: "none" }} tabIndex={-1} autoComplete="off" readOnly />

        <button
          type="submit"
          disabled={loading}
          className="btn-gold font-outfit"
          style={{
            padding: "15px 24px",
            borderRadius: "14px",
            fontSize: "15px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "4px",
            letterSpacing: "-0.01em",
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Claiming spot…
            </span>
          ) : (
            "Claim Your Spot →"
          )}
        </button>
      </form>

      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill="#F59E0B" stroke="none" />
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "#475569" }}>
          No spam. No contracts. You approve every request.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderRadius: "16px",
        border: `1.5px solid ${open ? "rgba(20,184,166,0.35)" : "rgba(255,255,255,0.08)"}`,
        background: open ? "rgba(20,184,166,0.06)" : "rgba(255,255,255,0.03)",
        transition: "all 0.25s ease",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: "16px",
        }}
      >
        <span
          className="font-outfit"
          style={{ fontSize: "16px", fontWeight: "700", color: "white", lineHeight: "1.4" }}
        >
          {q}
        </span>
        <ChevronDown
          size={18}
          color={open ? "#14B8A6" : "#475569"}
          style={{ flexShrink: 0, transition: "transform 0.25s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <div
        className={`faq-answer ${open ? "open" : ""}`}
        style={{ padding: open ? "0 24px 20px" : "0 24px" }}
      >
        <p style={{ fontSize: "15px", color: "#64748B", lineHeight: "1.8", margin: 0 }}>{a}</p>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ scrollToForm }: { scrollToForm: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled ? "rgba(10,10,15,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          className="font-outfit"
          style={{ fontSize: "22px", fontWeight: "900", color: "#14B8A6", letterSpacing: "-0.02em" }}
        >
          LEAKY
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "12px", color: "#475569", fontWeight: "600" }}>
            <span style={{ color: "#14B8A6" }}>●</span> 847 creators inside
          </span>
          <button
            onClick={scrollToForm}
            className="btn-gold font-outfit"
            style={{
              padding: "9px 20px",
              borderRadius: "10px",
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Get Early Access
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Cookie Consent ───────────────────────────────────────────────────────────

function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("leaky_cookie_consent")) setVisible(true);
    } catch {
      // localStorage unavailable (private browsing etc.)
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem("leaky_cookie_consent", "accepted"); } catch { /* noop */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "calc(100% - 32px)",
        maxWidth: "620px",
        background: "#111118",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "16px",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        flexWrap: "wrap",
      }}
    >
      <p style={{ flex: 1, minWidth: "200px", fontSize: "13px", color: "#94A3B8", margin: 0, lineHeight: "1.6" }}>
        We use essential cookies to make this site work.{" "}
        <a href="/privacy" style={{ color: "#14B8A6", textDecoration: "underline" }}>
          Privacy Policy
        </a>
        .
      </p>
      <button
        onClick={accept}
        className="btn-teal"
        style={{
          padding: "9px 20px",
          borderRadius: "10px",
          fontSize: "13px",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        Got it
      </button>
    </div>
  );
}

// ─── Section Analytics Hook ───────────────────────────────────────────────────
// Tracks how long each section is in view using IntersectionObserver.

function useSectionTracking() {
  const posthog = usePostHog();
  const sectionTimers = useRef<Record<string, number>>({});

  const trackSection = useCallback(
    (sectionId: string, el: Element | null) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            sectionTimers.current[sectionId] = Date.now();
          } else if (sectionTimers.current[sectionId]) {
            const seconds = Math.round((Date.now() - sectionTimers.current[sectionId]) / 1000);
            delete sectionTimers.current[sectionId];
            if (seconds >= 1) {
              posthog?.capture("section_viewed", { section: sectionId, seconds_in_view: seconds });
            }
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    },
    [posthog]
  );

  return trackSection;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WaitlistPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const [, setFormSuccess] = useState(false);
  const posthog = usePostHog();
  const trackSection = useSectionTracking();

  // Section refs for engagement tracking
  const heroRef = useRef<HTMLElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const signupRef = useRef<HTMLElement>(null);
  const earningsRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  // Track total time on page
  const pageOpenedAt = useRef(Date.now());

  useEffect(() => {
    // Track page visit
    posthog?.capture("landing_page_viewed");

    // Track total time when user leaves
    const handleLeave = () => {
      const seconds = Math.round((Date.now() - pageOpenedAt.current) / 1000);
      posthog?.capture("page_left", { total_seconds: seconds });
    };
    window.addEventListener("pagehide", handleLeave);
    return () => window.removeEventListener("pagehide", handleLeave);
  }, [posthog]);

  // Wire up section observers after mount
  useEffect(() => {
    const cleanups = [
      trackSection("hero", heroRef.current),
      trackSection("activity_ticker", tickerRef.current),
      trackSection("how_it_works", howItWorksRef.current),
      trackSection("signup_form", signupRef.current),
      trackSection("earnings_numbers", earningsRef.current),
      trackSection("faq", faqRef.current),
      trackSection("final_cta", ctaRef.current),
    ];
    return () => cleanups.forEach((c) => c?.());
  }, [trackSection]);

  const scrollToForm = () => {
    posthog?.capture("cta_clicked", { location: "hero" });
    document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Creator avatars for hero social proof stack
  const CREATOR_PROOFS = [
    { img: "https://i.pravatar.cc/40?img=47", earned: "$2,840 on avg / month" },
    { img: "https://i.pravatar.cc/40?img=25", earned: "$1,290 on avg / week" },
    { img: "https://i.pravatar.cc/40?img=63", earned: "$420 on avg / day" },
  ];

  return (
    <div style={{ background: "#0A0A0F", minHeight: "100vh" }}>
      <CookieConsent />
      <Navbar scrollToForm={scrollToForm} />

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          paddingTop: "130px",
          paddingBottom: "80px",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
            top: "-100px",
            right: "-200px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 70%)",
            bottom: "0",
            left: "-100px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "64px",
              alignItems: "center",
            }}
          >
            {/* Left: Copy */}
            <div>
              {/* Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "rgba(234,179,8,0.1)",
                  border: "1px solid rgba(234,179,8,0.2)",
                  borderRadius: "100px",
                  padding: "10px 20px",
                  marginBottom: "32px",
                  width: "fit-content",
                }}
              >
                <Lock size={11} color="#EAB308" />
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#EAB308", letterSpacing: "0.02em" }}>
                  919/1000 spots claimed · 80 left · 2K+ followers only
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-outfit"
                style={{
                  fontSize: "clamp(38px, 5.5vw, 66px)",
                  fontWeight: "900",
                  color: "white",
                  lineHeight: "1.02",
                  letterSpacing: "-0.035em",
                  marginBottom: "28px",
                }}
              >
                Creators like you
                <br />
                are getting paid
                <br />
                <span className="text-gradient-gold">while you scroll.</span>
              </h1>

              {/* Sub */}
              <p
                style={{
                  fontSize: "clamp(16px, 1.8vw, 19px)",
                  color: "#94A3B8",
                  lineHeight: "1.75",
                  marginBottom: "36px",
                  maxWidth: "480px",
                }}
              >
                Leaky is a closed circle of creators with 2K+ followers who earn when fans
                pay for engagement. Story features. Comments. Tags.{" "}
                <strong style={{ color: "white" }}>You approve every request.</strong>
              </p>

              {/* Social proof row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "32px",
                  padding: "14px 18px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "14px",
                  maxWidth: "380px",
                }}
              >
                <div style={{ display: "flex" }}>
                  {CREATOR_PROOFS.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid #0A0A0F",
                        marginLeft: i > 0 ? "-10px" : "0",
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.img} alt="" width={36} height={36} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "white" }}>
                    Joined this week
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>
                    {CREATOR_PROOFS[0].earned} · {CREATOR_PROOFS[1].earned}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
                <button
                  onClick={scrollToForm}
                  className="btn-gold font-outfit"
                  style={{
                    padding: "17px 36px",
                    borderRadius: "14px",
                    fontSize: "16px",
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Apply for Early Access
                  <ArrowRight size={18} />
                </button>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#EF4444",
                      display: "inline-block",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                  80 spots remaining
                </span>
              </div>
            </div>

            {/* Right: Phone */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <PhoneAnimation />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        `}</style>
      </section>

      {/* ── Activity Ticker ── */}
      <div ref={tickerRef}><ActivityTicker /></div>

      {/* ── How It Works ── */}
      <section ref={howItWorksRef} style={{ padding: "100px 0", background: "#0A0A0F" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#14B8A6",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            How It Works
          </p>
          <h2
            className="font-outfit"
            style={{
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: "900",
              color: "white",
              textAlign: "center",
              marginBottom: "16px",
              letterSpacing: "-0.03em",
            }}
          >
            Fans pay. You{" "}
            <span className="text-gradient-teal">choose</span>. You earn.
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: "#64748B",
              textAlign: "center",
              marginBottom: "72px",
              maxWidth: "480px",
              margin: "0 auto 72px",
            }}
          >
            No content to create. No profile to fill. Setup takes 2 minutes, and you instantly start receiving well-paid offers.
          </p>

          {/* 3 steps */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "2px",
              marginBottom: "64px",
            }}
          >
            {[
              {
                num: "01",
                title: "Fan sends a request",
                desc: "They find your profile, pick what they want (story feature, comment, tag), and pay upfront. Money is locked in escrow before you even see it.",
                accent: "#14B8A6",
              },
              {
                num: "02",
                title: "You review it",
                desc: "You see the request, the amount, and what they want. Accept, decline, or counter with your own price. You're always in control.",
                accent: "#EAB308",
              },
              {
                num: "03",
                title: "You get paid",
                desc: "Do it naturally — post the tag, drop the comment. The fan confirms. Funds release to your account every Friday.",
                accent: "#8B5CF6",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="dark-card"
                style={{
                  background: "#111118",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: i === 0 ? "20px 0 0 20px" : i === 2 ? "0 20px 20px 0" : "0",
                  padding: "36px 32px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    color: step.accent,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: "20px",
                  }}
                >
                  {step.num}
                </div>
                <h3
                  className="font-outfit"
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "white",
                    marginBottom: "12px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: "14px", color: "#64748B", lineHeight: "1.75" }}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Live request card */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <p style={{ fontSize: "12px", color: "#475569", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "32px" }}>
              This is what a request looks like
            </p>
            <RequestCardMockup />
          </div>
        </div>
      </section>

      {/* ── Two-column: Form + Benefits ── */}
      <section ref={signupRef} style={{ background: "#0D0D14", padding: "100px 0" }}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "56px",
            alignItems: "start",
          }}
        >
          {/* Form */}
          <div ref={formRef}>
            <WaitlistForm onSuccess={() => setFormSuccess(true)} />
          </div>

          {/* Benefits */}
          <div>
            <h2
              className="font-outfit"
              style={{
                fontSize: "clamp(26px, 3vw, 36px)",
                fontWeight: "900",
                color: "white",
                marginBottom: "8px",
                letterSpacing: "-0.02em",
              }}
            >
              Built for creators who value their time.
            </h2>
            <p style={{ fontSize: "15px", color: "#64748B", marginBottom: "32px", lineHeight: "1.6" }}>
              No gimmicks. No long-term commitment. Just money.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                {
                  title: "You approve every request",
                  desc: "See the request and amount before committing. Never do something you don't want. Your account, your rules.",
                  color: "#14B8A6",
                  icon: "✓",
                },
                {
                  title: "No contracts. No exclusivity.",
                  desc: "Use Leaky alongside Cameo, OnlyFans, Patreon, or anything else. Zero restrictions. It's just extra income.",
                  color: "#EAB308",
                  icon: "✓",
                },
                {
                  title: "Fans pay before you deliver",
                  desc: "Payment is locked in escrow before you see the request. You're never chasing anyone for money.",
                  color: "#8B5CF6",
                  icon: "✓",
                },
                {
                  title: "Zero setup. Instantly live.",
                  desc: "No profile to fill, no content to create. Set your prices and start receiving offers in 2 minutes. That's it.",
                  color: "#F97316",
                  icon: "✓",
                },
              ].map((b, i) => (
                <div
                  key={i}
                  className="dark-card"
                  style={{
                    background: "#111118",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "16px",
                    padding: "20px 22px",
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "10px",
                      background: `${b.color}18`,
                      border: `1px solid ${b.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "14px",
                      color: b.color,
                      fontWeight: "800",
                    }}
                  >
                    {b.icon}
                  </div>
                  <div>
                    <h3
                      className="font-outfit"
                      style={{ fontSize: "15px", fontWeight: "700", color: "white", marginBottom: "5px" }}
                    >
                      {b.title}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.65", margin: 0 }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Earnings Numbers ── */}
      <section ref={earningsRef} style={{ background: "#0A0A0F", padding: "100px 0" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#EAB308",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            Early Access Numbers
          </p>
          <h2
            className="font-outfit"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: "900",
              color: "white",
              textAlign: "center",
              marginBottom: "64px",
              letterSpacing: "-0.03em",
            }}
          >
            What creators inside are making.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              { value: "$247", label: "Average request value", note: "Per accepted request" },
              { value: "$2,400", label: "Average monthly earnings", note: "Based on early access creators" },
              { value: "2 min", label: "Setup time", note: "From signup to first offer" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "#111118",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "20px",
                  padding: "32px 28px",
                  textAlign: "center",
                }}
              >
                <div
                  className="font-outfit"
                  style={{
                    fontSize: "clamp(44px, 5vw, 60px)",
                    fontWeight: "900",
                    letterSpacing: "-0.04em",
                    marginBottom: "10px",
                    background: "linear-gradient(135deg, #EAB308, #F59E0B)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.value}
                </div>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "6px" }}>
                  {s.label}
                </p>
                <p style={{ fontSize: "11px", color: "#475569" }}>{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section ref={faqRef} style={{ background: "#0D0D14", padding: "100px 0" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>
          <h2
            className="font-outfit"
            style={{
              fontSize: "clamp(26px, 3.5vw, 40px)",
              fontWeight: "900",
              color: "white",
              textAlign: "center",
              marginBottom: "48px",
              letterSpacing: "-0.03em",
            }}
          >
            Questions?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section ref={ctaRef} style={{ padding: "120px 0", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, rgba(234,179,8,0.08) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(234,179,8,0.1)",
              border: "1px solid rgba(234,179,8,0.2)",
              borderRadius: "100px",
              padding: "8px 16px",
              marginBottom: "28px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#EF4444",
                display: "inline-block",
                animation: "pulse 1.5s infinite",
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#EAB308" }}>
              80 spots remaining
            </span>
          </div>

          <h2
            className="font-outfit"
            style={{
              fontSize: "clamp(36px, 5vw, 58px)",
              fontWeight: "900",
              color: "white",
              marginBottom: "20px",
              letterSpacing: "-0.035em",
              lineHeight: "1.05",
            }}
          >
            Every day you wait
            <br />
            is{" "}
            <span className="text-gradient-gold">money left behind.</span>
          </h2>

          <p style={{ fontSize: "17px", color: "#64748B", marginBottom: "40px", lineHeight: "1.7" }}>
            Creators already inside are getting requests right now. Your spot is waiting.
          </p>

          <button
            onClick={scrollToForm}
            className="btn-gold font-outfit"
            style={{
              padding: "18px 44px",
              borderRadius: "16px",
              fontSize: "17px",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              letterSpacing: "-0.01em",
            }}
          >
            Claim Your Spot Now
            <ArrowRight size={20} />
          </button>
          <p style={{ marginTop: "16px", fontSize: "12px", color: "#334155" }}>
            Free to join · No contracts · You approve every request
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: "#080810",
          padding: "40px 0",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <span
            className="font-outfit"
            style={{ fontSize: "20px", fontWeight: "900", color: "#14B8A6", display: "block", marginBottom: "12px" }}
          >
            LEAKY
          </span>
          <p style={{ fontSize: "12px", color: "#334155" }}>© 2026 Leaky. All rights reserved.</p>
          <p style={{ fontSize: "12px", color: "#1E293B", marginTop: "4px" }}>
            Get paid for what you already do.
          </p>
          <p style={{ fontSize: "12px", color: "#334155", marginTop: "12px" }}>
            <a href="/privacy" style={{ color: "#475569", textDecoration: "underline" }}>Privacy Policy</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
