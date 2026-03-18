"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";

const ROTATING_WORDS = ["creators", "models", "influencers", "athletes", "actors", "artists", "coaches", "entrepreneurs"];

const ENGAGEMENT_OPTIONS = [
  { id: "influencers-f", label: "Influencers", gender: "Women" },
  { id: "influencers-m", label: "Influencers", gender: "Men" },
  { id: "models-f",      label: "Models",       gender: "Women" },
  { id: "models-m",      label: "Models",       gender: "Men" },
  { id: "athletes-f",    label: "Athletes",     gender: "Women" },
  { id: "athletes-m",    label: "Athletes",     gender: "Men" },
  { id: "actresses",     label: "Actresses",    gender: "" },
  { id: "actors",        label: "Actors",       gender: "" },
  { id: "artists-f",     label: "Artists",      gender: "Women" },
  { id: "artists-m",     label: "Artists",      gender: "Men" },
  { id: "coaches-f",     label: "Coaches",      gender: "Women" },
  { id: "coaches-m",     label: "Coaches",      gender: "Men" },
  { id: "entrepreneurs-f", label: "Entrepreneurs", gender: "Women" },
  { id: "entrepreneurs-m", label: "Entrepreneurs", gender: "Men" },
];

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","temp-mail.org","throwaway.email","yopmail.com",
  "sharklasers.com","grr.la","guerrillamail.info","spam4.me","dispostable.com",
  "maildrop.cc","trashmail.com","trashmail.me","trashmail.net","trash-mail.at",
  "fakeinbox.com","10minutemail.com","tempmail.com","dropmail.me","tempr.email",
  "discard.email","spamgourmet.com","mailnull.com","spamex.com","binkmail.com",
  "mt2014.com","nwytg.com","inboxproxy.com","spamfree24.org","mailtemporary.com",
]);

function isRealName(name: string): boolean {
  const trimmed = name.trim();
  if (!/^[a-zA-Z\u00C0-\u024F' -]+$/.test(trimmed)) return false;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 2) return false;
  if (words.some(w => w.length < 2)) return false;
  const lower = trimmed.toLowerCase();
  const fakes = ["test", "fake", "asdf", "qwerty", "lorem", "ipsum", "admin", "user", "null", "undefined"];
  if (fakes.some(f => lower.includes(f))) return false;
  return true;
}

function isRealEmail(email: string): boolean {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return false;
  const domain = email.split("@")[1].toLowerCase();
  if (DISPOSABLE_DOMAINS.has(domain)) return false;
  const local = email.split("@")[0];
  if (/^(.)\1{3,}/.test(local)) return false; // e.g. aaaa@
  return true;
}

interface FormData {
  fullName: string;
  email: string;
  instagramHandle: string;
  tiktokHandle: string;
  engagementTarget: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  social?: string;
  engagementTarget?: string;
}

export default function MembersPage() {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    instagramHandle: "",
    tiktokHandle: "",
    engagementTarget: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const formLoadedAt = useRef<number>(Date.now());

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setRotatingIndex(i => (i + 1) % ROTATING_WORDS.length);
        setWordVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.fullName.trim()) {
      errs.fullName = "Please enter your full name.";
    } else if (!isRealName(form.fullName)) {
      errs.fullName = "Please enter your real first and last name.";
    }
    if (!form.email.trim()) {
      errs.email = "Please enter a valid email address.";
    } else if (!isRealEmail(form.email)) {
      errs.email = "Please use a real, permanent email address.";
    }
    if (!form.instagramHandle.trim() && !form.tiktokHandle.trim()) {
      errs.social = "Add at least one — Instagram or TikTok.";
    }
    if (!form.engagementTarget) {
      errs.engagementTarget = "Pick who you want engagement from.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          instagramHandle: form.instagramHandle,
          tiktokHandle: form.tiktokHandle,
          engagementTarget: form.engagementTarget,
          formLoadedAt: formLoadedAt.current,
          website: "",
          _gotcha: "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setErrors({ email: data.error || "Something went wrong." });
      }
    } catch {
      setErrors({ email: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const socialError = !!errors.social;

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    const firstName = form.fullName.trim().split(" ")[0];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ background: "#07070F" }}>
        <style>{`
          @keyframes drift1 {
            0%,100% { transform: translate(0,0) scale(1); }
            50% { transform: translate(40px,-30px) scale(1.05); }
          }
          @keyframes drift2 {
            0%,100% { transform: translate(0,0) scale(1); }
            50% { transform: translate(-30px,25px) scale(0.95); }
          }
        `}</style>
        <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "10%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,165,0,0.07), transparent 70%)", animation: "drift1 14s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,205,180,0.04), transparent 70%)", animation: "drift2 18s ease-in-out infinite" }} />
        </div>
        <div className="w-full max-w-md rounded-2xl p-10 text-center" style={{ background: "#0D0D1A", border: "1px solid #1A1A2E", position: "relative", zIndex: 1 }}>
          <div className="flex justify-center mb-6">
            <CheckCircle2 size={52} color="#F0A500" strokeWidth={1.5} />
          </div>
          <p className="font-epilogue text-xs font-bold uppercase tracking-[0.2em] mb-5" style={{ color: "#F0A500" }}>
            — Spot secured —
          </p>
          <h2 className="font-syne text-3xl font-black mb-3" style={{ color: "#EDEDFF" }}>
            You&apos;re in, {firstName}.
          </h2>
          <p className="font-epilogue text-base mb-8" style={{ color: "#7A7A9E", lineHeight: 1.75 }}>
            You&apos;re now on the early access list for Leaky. We&apos;ll let you know as soon as member spots open so you can start making requests.
          </p>
          <div className="rounded-xl p-6 text-left" style={{ background: "rgba(240,165,0,0.06)", border: "1px solid rgba(240,165,0,0.15)" }}>
            <p className="font-epilogue text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F0A500" }}>What happens next</p>
            {["We review the early access list", "You get notified 48h before spots open", "Make your first request to a creator"].map((step, i) => (
              <div key={i} className="flex items-center gap-4 py-3" style={{ borderBottom: i < 2 ? "1px solid #1A1A2E" : "none" }}>
                <span className="font-syne text-sm font-black" style={{ color: "#F0A500", minWidth: 24 }}>0{i + 1}</span>
                <span className="font-epilogue text-sm" style={{ color: "#7A7A9E" }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#07070F" }}>
      <style>{`
        @keyframes drift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(40px,-30px) scale(1.05); }
        }
        @keyframes drift2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-30px,25px) scale(0.95); }
        }
        @keyframes drift3 {
          0%,100% { transform: translate(0,0); }
          33% { transform: translate(20px,15px); }
          66% { transform: translate(-15px,-10px); }
        }
        @keyframes livepulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.7); }
        }
        @keyframes blink {
          0%,100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .members-input::placeholder {
          color: #2E2E48;
          font-style: italic;
          letter-spacing: 0.01em;
        }
      `}</style>

      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-5%", right: "10%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,165,0,0.065), transparent 70%)", animation: "drift1 16s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "-5%", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,205,180,0.045), transparent 70%)", animation: "drift2 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "55%", right: "-8%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,165,0,0.035), transparent 70%)", animation: "drift3 24s ease-in-out infinite" }} />
      </div>

      {/* Nav */}
      <nav style={{ position: "relative", zIndex: 1 }} className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <span className="font-syne text-xl font-black uppercase tracking-widest" style={{ color: "#F0A500" }}>
          LEAKY
        </span>
        {/* Live counter — editorial style */}
        <div className="flex items-baseline gap-2">
          <span style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#F0A500",
            animation: "livepulse 2s ease-in-out infinite",
            flexShrink: 0,
            alignSelf: "center",
          }} />
          <span className="font-epilogue font-black" style={{ color: "#EDEDFF", fontSize: 15, lineHeight: 1, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums lining-nums" }}>847</span>
          <span className="font-epilogue" style={{ color: "#EDEDFF", fontSize: 15, lineHeight: 1, opacity: wordVisible ? 1 : 0, transition: "opacity 0.3s", display: "inline-block" }}>{ROTATING_WORDS[rotatingIndex]}</span>
          <span className="font-epilogue" style={{ color: "#4A4A6A", fontSize: 11, letterSpacing: "0.08em", lineHeight: 1 }}>ready</span>
        </div>
      </nav>

      {/* Hero + Form */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12" style={{ position: "relative", zIndex: 1 }}>
        <div className="w-full max-w-md">

          {/* Status indicator — editorial, not a pill */}
          <div className="mb-7 flex items-center gap-3">
            <div style={{ width: 28, height: 1, background: "#F0A500", opacity: 0.5 }} />
            <span className="font-epilogue text-xs font-bold uppercase tracking-[0.22em]" style={{ color: "#F0A500" }}>
              Founding Members · Q2 2026
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-syne text-4xl font-black mb-5 leading-tight" style={{ color: "#EDEDFF", letterSpacing: "-0.02em" }}>
            Be the one getting mentioned.
          </h1>
          <p className="font-epilogue text-base mb-10" style={{ color: "#6A6A8E", lineHeight: 2, letterSpacing: "0.01em" }}>
            Pick a <span style={{ color: "#EDEDFF", opacity: wordVisible ? 1 : 0, transition: "opacity 0.3s", display: "inline-block" }}>{ROTATING_WORDS[rotatingIndex]}</span>. Request a story tag, comment, or feature. They post — you look like you know people worth knowing. Real engagement, no bots, no fake followers.
          </p>

          {/* Form card */}
          <div className="rounded-2xl p-8" style={{ background: "#0D0D1A", border: "1px solid #1C1C2E" }}>
            <form onSubmit={handleSubmit} noValidate>
              {/* Honeypot */}
              <input type="text" name="website" autoComplete="off" tabIndex={-1} style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0 }} />
              <input type="text" name="_gotcha" autoComplete="off" tabIndex={-1} style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0 }} />

              {/* Full name */}
              <div className="mb-5">
                <label className="font-epilogue block text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: "#5A5A7A", letterSpacing: "0.15em" }}>
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="input-field members-input font-epilogue w-full rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: "#07070F",
                    border: `1px solid ${errors.fullName ? "#FF6B6B" : "#1C1C2E"}`,
                    color: "#EDEDFF",
                    fontFamily: "var(--font-epilogue)",
                  }}
                  autoComplete="name"
                />
                {errors.fullName && <p className="font-epilogue text-xs mt-1.5" style={{ color: "#FF6B6B" }}>{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="mb-5">
                <label className="font-epilogue block text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: "#5A5A7A", letterSpacing: "0.15em" }}>
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field members-input font-epilogue w-full rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: "#07070F",
                    border: `1px solid ${errors.email ? "#FF6B6B" : "#1C1C2E"}`,
                    color: "#EDEDFF",
                    fontFamily: "var(--font-epilogue)",
                  }}
                  autoComplete="email"
                />
                {errors.email && <p className="font-epilogue text-xs mt-1.5" style={{ color: "#FF6B6B" }}>{errors.email}</p>}
              </div>

              {/* Social handles — grouped */}
              <div className="mb-7">
                <label className="font-epilogue block text-xs font-semibold uppercase mb-3" style={{ color: "#5A5A7A", letterSpacing: "0.15em" }}>
                  Social handle <span style={{ color: "#3A3A5A", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>— at least one</span>
                </label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-epilogue text-xs font-bold uppercase tracking-wider" style={{ color: "#3A3A5A", minWidth: 72 }}>Instagram</span>
                    <input
                      type="text"
                      placeholder="@handle"
                      value={form.instagramHandle}
                      onChange={e => {
                        setForm(f => ({ ...f, instagramHandle: e.target.value }));
                        if (errors.social) setErrors(err => ({ ...err, social: undefined }));
                      }}
                      className="input-field members-input font-epilogue flex-1 rounded-xl px-4 py-3 text-sm"
                      style={{
                        background: "#07070F",
                        border: `1px solid ${socialError ? "#FF6B6B" : "#1C1C2E"}`,
                        color: "#EDEDFF",
                        fontFamily: "var(--font-epilogue)",
                      }}
                      autoComplete="off"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-epilogue text-xs font-bold uppercase tracking-wider" style={{ color: "#3A3A5A", minWidth: 72 }}>TikTok</span>
                    <input
                      type="text"
                      placeholder="@handle"
                      value={form.tiktokHandle}
                      onChange={e => {
                        setForm(f => ({ ...f, tiktokHandle: e.target.value }));
                        if (errors.social) setErrors(err => ({ ...err, social: undefined }));
                      }}
                      className="input-field members-input font-epilogue flex-1 rounded-xl px-4 py-3 text-sm"
                      style={{
                        background: "#07070F",
                        border: `1px solid ${socialError ? "#FF6B6B" : "#1C1C2E"}`,
                        color: "#EDEDFF",
                        fontFamily: "var(--font-epilogue)",
                      }}
                      autoComplete="off"
                    />
                  </div>
                </div>
                {errors.social && <p className="font-epilogue text-xs mt-2" style={{ color: "#FF6B6B" }}>{errors.social}</p>}
              </div>

              {/* Engagement target */}
              <div className="mb-7">
                <label className="font-epilogue block text-xs font-semibold uppercase mb-3" style={{ color: "#5A5A7A", letterSpacing: "0.15em" }}>
                  Who do you want engagement from?
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {ENGAGEMENT_OPTIONS.map(opt => {
                    const selected = form.engagementTarget === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setForm(f => ({ ...f, engagementTarget: opt.id }));
                          if (errors.engagementTarget) setErrors(err => ({ ...err, engagementTarget: undefined }));
                        }}
                        style={{
                          background: selected ? "rgba(240,165,0,0.10)" : "#07070F",
                          border: `1px solid ${errors.engagementTarget && !form.engagementTarget ? "#FF6B6B" : selected ? "#F0A500" : "#1C1C2E"}`,
                          borderRadius: 12,
                          padding: "10px 12px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "border-color 0.15s, background 0.15s",
                        }}
                      >
                        <span className="font-epilogue text-xs font-bold" style={{ color: selected ? "#F0A500" : "#7A7A9E", display: "block", lineHeight: 1.3 }}>
                          {opt.label}
                        </span>
                        {opt.gender && (
                          <span className="font-epilogue" style={{ fontSize: 10, color: selected ? "rgba(240,165,0,0.6)" : "#3A3A5A", letterSpacing: "0.06em" }}>
                            {opt.gender}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.engagementTarget && (
                  <p className="font-epilogue text-xs mt-2" style={{ color: "#FF6B6B" }}>{errors.engagementTarget}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold font-syne w-full rounded-xl py-4 font-black uppercase"
                style={{ fontSize: 16, letterSpacing: "0.08em", color: "#07070F" }}
              >
                {loading ? "Submitting…" : "Request Early Access"}
              </button>
            </form>

            <p className="font-epilogue text-xs text-center mt-5" style={{ color: "#3A3A5A", letterSpacing: "0.02em" }}>
              No payments yet. No bots. Just your spot before it opens.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
