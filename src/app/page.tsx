"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Hand,
  Zap,
  Globe,
  Wallet,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface FormData {
  email: string;
  instagramHandle: string;
  followers: string;
  category: string;
}

interface FormErrors {
  email?: string;
  instagramHandle?: string;
  followers?: string;
  category?: string;
}

// ─── Data ───────────────────────────────────────────────────────────────────

const FOLLOWER_OPTIONS = [
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

const BENEFITS = [
  {
    icon: Hand,
    iconBg: "#14B8A6",
    title: "You Choose Every Request",
    desc: "Fans send requests with payment amounts. You see them and decide: accept or decline. No obligation. No pressure.",
  },
  {
    icon: Wallet,
    iconBg: "#8B5CF6",
    title: "Get Paid Instantly",
    desc: "Accept a request, complete it, get paid. Weekly payouts to your bank account. No waiting.",
  },
  {
    icon: Zap,
    iconBg: "#F97316",
    title: "Zero Setup Required",
    desc: "No profile to fill. No content to create. Sign up, set prices, start earning. Takes 2 minutes.",
  },
  {
    icon: Globe,
    iconBg: "#06b6d4",
    title: "Works Alongside Everything",
    desc: "Use Leaky with Cameo, OnlyFans, Patreon, or anything else. No exclusivity. No restrictions.",
  },
];

const FAN_PAYS = [
  {
    type: "Story Feature",
    range: "$100 – $500",
    why: "Fan pays you to feature them in your story. It makes them look more connected, more desirable — they show their friends who featured them.",
    color: "#14B8A6",
  },
  {
    type: "Comment",
    range: "$50 – $200",
    why: "Fan pays you to comment on their post. A comment from a popular creator signals they're worth knowing and boosts their credibility.",
    color: "#8B5CF6",
  },
  {
    type: "Post Tag",
    range: "$150 – $400",
    why: "Fan pays you to tag them in your post. Being tagged by a popular creator = social proof their followers see.",
    color: "#F97316",
  },
  {
    type: "Story Mention",
    range: "$75 – $250",
    why: "Fan pays you to mention them in your story. It's like a public endorsement — makes them feel validated and popular.",
    color: "#06b6d4",
  },
];

const STATS = [
  {
    value: "$2,400",
    label: "Average Monthly Earnings",
    sub: "From 50–100 requests/month",
  },
  {
    value: "$8,500",
    label: "Highest Earner (30 days)",
    sub: "Model with 500K followers",
  },
  {
    value: "2 min",
    label: "Time to Set Up",
    sub: "Sign up, set prices, done",
  },
];

const STEPS = [
  { num: "1", title: "Sign Up", desc: "Create your account in 2 minutes. No profile to fill." },
  { num: "2", title: "Set Your Prices", desc: "Decide what you charge for stories, comments, tags." },
  { num: "3", title: "Receive Requests", desc: "Fans find your profile and send requests with payment." },
  { num: "4", title: "You Choose", desc: "See each request. Accept the ones you want. Decline the rest." },
  { num: "5", title: "Get Paid", desc: "Complete it naturally. Money hits your account weekly." },
];

const FAQS = [
  {
    q: "Do I have to accept every request?",
    a: "No. You see each request with the payment amount and decide. If you don't want to do it, just decline. No penalty, no explanation needed.",
  },
  {
    q: "What exactly are fans paying for?",
    a: "They're paying for authentic engagement from you — a comment on their post, a story feature, a tag, a mention. It's social proof. They show their friends they're connected to someone popular. You're just being yourself.",
  },
  {
    q: "Do I need to fill out a profile?",
    a: "Nope. Just sign up, set your prices, and start receiving requests. That's it. The whole setup takes about 2 minutes.",
  },
  {
    q: "Is this ethical?",
    a: "Absolutely. You're not doing anything fake. You're getting paid for genuine engagement. Fans get social proof from someone they admire, you get paid for what you'd naturally do anyway. Win-win.",
  },
  {
    q: "How much can I really earn?",
    a: "It depends on your follower count and engagement rate. Most creators earn $1,000–$5,000/month. Top creators earn $10,000+/month. It's totally up to you — the more requests you accept, the more you earn.",
  },
  {
    q: "When do I get paid?",
    a: "Every Friday, we send your earnings to your bank account. You'll see money within 1–3 business days.",
  },
];

// ─── iPhone Animation ────────────────────────────────────────────────────────

const PHONE_EVENTS = [
  { label: "❤️  Liked their post", amount: "+$65", delay: 0 },
  { label: "💬  Commented on post", amount: "+$150", delay: 2200 },
  { label: "📖  Story feature", amount: "+$500", delay: 4400 },
  { label: "🏷️  Tagged in post", amount: "+$200", delay: 6600 },
];

function PhoneAnimation() {
  const [step, setStep] = useState(-1);
  const [total, setTotal] = useState(0);
  const totals = [65, 215, 715, 915];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    PHONE_EVENTS.forEach((ev, i) => {
      timers.push(
        setTimeout(() => {
          setStep(i);
          setTotal(totals[i]);
        }, ev.delay + 800)
      );
    });
    // loop
    const loopTimer = setTimeout(() => {
      setStep(-1);
      setTotal(0);
      setTimeout(() => setStep(-2), 100); // trigger re-run via key change
    }, 9600);
    timers.push(loopTimer);
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step === -2]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Phone frame */}
      <div
        style={{
          width: "220px",
          height: "440px",
          borderRadius: "36px",
          background: "#0F172A",
          border: "6px solid #1E293B",
          boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
          overflow: "hidden",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Status bar */}
        <div style={{ background: "#0F172A", padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "white" }}>9:41</span>
          <div style={{ width: "80px", height: "20px", borderRadius: "10px", background: "#1E293B" }} />
          <span style={{ fontSize: "11px", color: "white" }}>●●●</span>
        </div>

        {/* Instagram-like header */}
        <div style={{ background: "white", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9" }}>
          <span style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A", fontFamily: "serif", fontStyle: "italic" }}>Instagram</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: "1.5px solid #0F172A" }} />
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "1.5px solid #0F172A" }} />
          </div>
        </div>

        {/* Feed */}
        <div style={{ background: "white", flex: 1, overflow: "hidden", height: "calc(100% - 90px)" }}>
          {/* Post 1 */}
          <div style={{ borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #F97316, #EC4899)" }} />
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#0F172A" }}>@creator</span>
            </div>
            <div style={{ width: "100%", height: "130px", background: "linear-gradient(135deg, #E0F2FE, #BAE6FD, #7DD3FC)" }} />
            <div style={{ padding: "10px 12px" }}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
                {/* Heart */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill={step >= 0 ? "#EF4444" : "none"} stroke={step >= 0 ? "#EF4444" : "#0F172A"} strokeWidth="2" style={{ transition: "all 0.3s", transform: step === 0 ? "scale(1.3)" : "scale(1)" }}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {/* Comment */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div style={{ height: "8px", background: "#F1F5F9", borderRadius: "4px", width: "80%", marginBottom: "4px" }} />
              <div style={{ height: "8px", background: "#F1F5F9", borderRadius: "4px", width: "60%" }} />
            </div>
          </div>

          {/* Post 2 */}
          <div>
            <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #14B8A6, #06b6d4)" }} />
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#0F172A" }}>@user</span>
            </div>
            <div style={{ width: "100%", height: "100px", background: "linear-gradient(135deg, #FEF3C7, #FDE68A, #FCD34D)" }} />
          </div>
        </div>

        {/* Money pop overlays */}
        {PHONE_EVENTS.map((ev, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translateX(-50%)",
              opacity: step === i ? 1 : 0,
              transition: "opacity 0.3s ease",
              pointerEvents: "none",
              zIndex: 10,
              textAlign: "center",
              animation: step === i ? "moneyPop 2s ease forwards" : "none",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #14B8A6, #06b6d4)",
                color: "white",
                borderRadius: "20px",
                padding: "8px 16px",
                fontSize: "20px",
                fontWeight: "900",
                fontFamily: "var(--font-outfit)",
                boxShadow: "0 8px 24px rgba(20,184,166,0.5)",
                whiteSpace: "nowrap",
              }}
            >
              {ev.amount}
            </div>
            <div style={{ fontSize: "10px", color: "white", marginTop: "4px", fontWeight: "600", background: "rgba(0,0,0,0.5)", borderRadius: "8px", padding: "3px 8px" }}>
              {ev.label}
            </div>
          </div>
        ))}

        {/* Running total */}
        {total > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(15,23,42,0.92)",
              borderRadius: "16px",
              padding: "8px 16px",
              zIndex: 20,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "600", marginBottom: "2px" }}>earned today</div>
            <div style={{ fontSize: "20px", fontWeight: "900", color: "#14B8A6", fontFamily: "var(--font-outfit)", letterSpacing: "-0.02em" }}>
              ${total.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes moneyPop {
          0% { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.7); }
          15% { opacity: 1; transform: translateX(-50%) translateY(-10px) scale(1.1); }
          60% { opacity: 1; transform: translateX(-50%) translateY(-30px) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-60px) scale(0.9); }
        }
      `}</style>
    </div>
  );
}

// ─── Components ─────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: "white",
        borderBottom: scrolled ? "1px solid #E2E8F0" : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <span
          className="font-outfit text-2xl font-black tracking-tight"
          style={{ color: "#14B8A6" }}
        >
          LEAKY
        </span>
        <span
          className="font-outfit text-sm font-semibold px-4 py-1.5 rounded-full"
          style={{ background: "#F0FDF9", color: "#0F766E", border: "1px solid #CCFBF1" }}
        >
          For Creators
        </span>
      </div>
    </nav>
  );
}

function WaitlistForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<FormData>({
    email: "",
    instagramHandle: "",
    followers: "",
    category: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email address.";
    if (!form.instagramHandle.trim())
      e.instagramHandle = "Instagram handle is required.";
    if (!form.followers) e.followers = "Please select your follower count.";
    if (!form.category) e.category = "Please select your category.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Something went wrong.");
      setSubmitted(true);
      setForm({ email: "", instagramHandle: "", followers: "", category: "" });
      onSuccess();
      toast.success("🎉 You're on the waitlist!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1.5px solid #E2E8F0",
    fontSize: "15px",
    color: "#0F172A",
    background: "white",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "#64748B",
    marginBottom: "6px",
  };

  const errorStyle = { fontSize: "12px", color: "#EF4444", marginTop: "4px" };

  if (submitted) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "48px 40px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#F0FDF9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <CheckCircle2 size={32} color="#14B8A6" />
        </div>
        <h3 className="font-outfit" style={{ fontSize: "24px", fontWeight: "800", color: "#0F172A", marginBottom: "12px" }}>
          You&apos;re in! 🎉
        </h3>
        <p style={{ color: "#64748B", fontSize: "15px", lineHeight: "1.7", marginBottom: "24px" }}>
          Your <strong style={{ color: "#14B8A6" }}>$100 launch bonus</strong> is locked in.
          We&apos;ll email you 48h before we go live.
        </p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
          {["You Choose", "$100 Bonus", "Early Access"].map((badge) => (
            <span
              key={badge}
              style={{
                background: "#F0FDF9",
                color: "#0F766E",
                border: "1px solid #CCFBF1",
                borderRadius: "100px",
                padding: "6px 14px",
                fontSize: "13px",
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
        background: "white",
        borderRadius: "24px",
        padding: "36px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        position: "sticky",
        top: "100px",
      }}
    >
      <h3
        className="font-outfit"
        style={{ fontSize: "22px", fontWeight: "800", color: "#0F172A", marginBottom: "6px" }}
      >
        Join the Waitlist
      </h3>
      <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "24px" }}>
        Secure your spot + $100 launch bonus.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field"
            style={{ ...inputStyle, borderColor: errors.email ? "#EF4444" : "#E2E8F0" }}
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
                color: "#94A3B8",
                fontSize: "15px",
                fontWeight: "500",
                pointerEvents: "none",
              }}
            >
              @
            </span>
            <input
              type="text"
              placeholder="yourhandle"
              value={form.instagramHandle.replace(/^@/, "")}
              onChange={(e) =>
                setForm({ ...form, instagramHandle: e.target.value.replace(/^@/, "") })
              }
              className="input-field"
              style={{
                ...inputStyle,
                paddingLeft: "30px",
                borderColor: errors.instagramHandle ? "#EF4444" : "#E2E8F0",
              }}
            />
          </div>
          {errors.instagramHandle && <p style={errorStyle}>{errors.instagramHandle}</p>}
        </div>

        <div>
          <label style={labelStyle}>Follower Count</label>
          <select
            value={form.followers}
            onChange={(e) => setForm({ ...form, followers: e.target.value })}
            className="input-field"
            style={{
              ...inputStyle,
              cursor: "pointer",
              borderColor: errors.followers ? "#EF4444" : "#E2E8F0",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
              paddingRight: "40px",
            }}
          >
            <option value="">Select follower count…</option>
            {FOLLOWER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.followers && <p style={errorStyle}>{errors.followers}</p>}
        </div>

        <div>
          <label style={labelStyle}>Your Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-field"
            style={{
              ...inputStyle,
              cursor: "pointer",
              borderColor: errors.category ? "#EF4444" : "#E2E8F0",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
              paddingRight: "40px",
            }}
          >
            <option value="">Select your niche…</option>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.category && <p style={errorStyle}>{errors.category}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-coral font-outfit"
          style={{
            padding: "15px 24px",
            borderRadius: "14px",
            fontSize: "15px",
            fontWeight: "700",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "4px",
            letterSpacing: "-0.01em",
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Joining…
            </span>
          ) : (
            "Join Waitlist + Get $100 Bonus →"
          )}
        </button>
      </form>

      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #F1F5F9" }}>
        <p style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "10px" }}>
          ✓ No spam. Only updates about Leaky.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex" }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} fill="#F59E0B" stroke="none" />
            ))}
          </div>
          <p style={{ fontSize: "13px", color: "#64748B", fontWeight: "500" }}>
            <strong style={{ color: "#0F172A" }}>847</strong> creators already on the waitlist
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1.5px solid",
        borderColor: open ? "#14B8A6" : "#E2E8F0",
        background: open ? "#F0FDF9" : "white",
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
          style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", lineHeight: "1.4" }}
        >
          {q}
        </span>
        <ChevronDown
          size={20}
          color={open ? "#14B8A6" : "#94A3B8"}
          style={{
            flexShrink: 0,
            transition: "transform 0.25s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <div
        className={`faq-answer ${open ? "open" : ""}`}
        style={{ padding: open ? "0 24px 20px" : "0 24px" }}
      >
        <p style={{ fontSize: "15px", color: "#475569", lineHeight: "1.8", margin: 0 }}>{a}</p>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function WaitlistPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const [, setFormSuccess] = useState(false);

  const scrollToForm = () => {
    document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div style={{ background: "#F8F7F4", minHeight: "100vh" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          paddingTop: "120px",
          paddingBottom: "80px",
          overflow: "hidden",
          background: "#F8F7F4",
        }}
      >
        {/* Decorative blobs */}
        <div className="hero-blob" style={{ width: "500px", height: "500px", background: "rgba(20, 184, 166, 0.10)", top: "-100px", right: "-100px" }} />
        <div className="hero-blob" style={{ width: "300px", height: "300px", background: "rgba(139, 92, 246, 0.07)", bottom: "0", left: "5%" }} />

        <div className="max-w-6xl mx-auto px-6" style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "60px",
              alignItems: "center",
            }}
          >
            {/* Left: Copy */}
            <div>
              {/* Pill */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#F0FDF9", border: "1px solid #CCFBF1", borderRadius: "100px", padding: "8px 16px", marginBottom: "28px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#14B8A6", display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#0F766E" }}>Early access — limited spots</span>
              </div>

              {/* Headline */}
              <h1
                className="font-outfit"
                style={{
                  fontSize: "clamp(36px, 6vw, 64px)",
                  fontWeight: "900",
                  color: "#0F172A",
                  lineHeight: "1.05",
                  letterSpacing: "-0.03em",
                  marginBottom: "24px",
                }}
              >
                Get Paid for{" "}
                <span className="text-gradient-teal">What You Already Do</span>
              </h1>

              {/* Sub */}
              <p
                style={{
                  fontSize: "clamp(16px, 2vw, 19px)",
                  color: "#475569",
                  lineHeight: "1.75",
                  marginBottom: "36px",
                  maxWidth: "520px",
                }}
              >
                Fans pay to be featured in your stories, comments, and posts.
                You choose which requests to accept.{" "}
                <strong style={{ color: "#0F172A" }}>You keep all the earnings.</strong>
              </p>

              {/* Trust badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "40px" }}>
                {["No profile to fill", "Choose every request", "Get paid instantly"].map((badge) => (
                  <span
                    key={badge}
                    style={{
                      background: "white",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: "100px",
                      padding: "9px 18px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#0F172A",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    ✓ {badge}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={scrollToForm}
                className="btn-coral font-outfit"
                style={{
                  padding: "18px 40px",
                  borderRadius: "16px",
                  fontSize: "17px",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  letterSpacing: "-0.01em",
                }}
              >
                Join Waitlist + Get $100 Bonus
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Right: Phone animation */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <PhoneAnimation />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </section>

      {/* ── What fans pay for ── */}
      <section style={{ background: "white", padding: "100px 0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <p style={{ fontSize: "13px", fontWeight: "600", color: "#14B8A6", textTransform: "uppercase", letterSpacing: "0.15em", textAlign: "center", marginBottom: "16px" }}>
            The Mechanic
          </p>
          <h2
            className="font-outfit"
            style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", color: "#0F172A", textAlign: "center", marginBottom: "16px", letterSpacing: "-0.02em" }}
          >
            Fans Pay for Social Proof. You Earn for Being You.
          </h2>
          <p style={{ fontSize: "17px", color: "#64748B", textAlign: "center", maxWidth: "560px", margin: "0 auto 56px", lineHeight: "1.7" }}>
            Fans use Leaky to buy authentic engagement from creators they admire. Here&apos;s what they&apos;re paying for.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {FAN_PAYS.map((item) => (
              <div
                key={item.type}
                style={{
                  background: "#F8F7F4",
                  borderRadius: "20px",
                  padding: "28px 24px",
                  border: "1.5px solid #F1F5F9",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                className="benefit-card"
              >
                <div
                  style={{
                    display: "inline-block",
                    background: item.color,
                    color: "white",
                    borderRadius: "10px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}
                >
                  {item.type}
                </div>
                <div
                  className="font-outfit"
                  style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", marginBottom: "12px", letterSpacing: "-0.02em" }}
                >
                  {item.range}
                </div>
                <p style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.7", margin: 0 }}>
                  {item.why}
                </p>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: "40px",
              background: "#F0FDF9",
              border: "1.5px solid #CCFBF1",
              borderRadius: "16px",
              padding: "20px 28px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "15px", color: "#0F766E", fontWeight: "600", margin: 0 }}>
              💡 Fans aren&apos;t paying for something fake. They&apos;re paying for authentic engagement from someone they admire.
              <strong> You&apos;re just being yourself.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Two-Column ── */}
      <section style={{ background: "#F8F7F4", paddingTop: "100px", paddingBottom: "100px" }}>
        <div
          className="max-w-6xl mx-auto px-6"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "48px",
            alignItems: "start",
          }}
        >
          {/* Left — Form */}
          <div ref={formRef}>
            <WaitlistForm onSuccess={() => setFormSuccess(true)} />
          </div>

          {/* Right — Benefits */}
          <div>
            <h2
              className="font-outfit"
              style={{
                fontSize: "32px",
                fontWeight: "800",
                color: "#0F172A",
                marginBottom: "8px",
                letterSpacing: "-0.02em",
              }}
            >
              You Choose. You Earn.
            </h2>
            <p style={{ fontSize: "15px", color: "#64748B", marginBottom: "28px", lineHeight: "1.6" }}>
              It&apos;s not work. It&apos;s getting paid for what you already do.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="benefit-card"
                    style={{
                      background: "white",
                      borderRadius: "18px",
                      padding: "22px 24px",
                      display: "flex",
                      gap: "18px",
                      alignItems: "flex-start",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                      border: "1px solid #F1F5F9",
                    }}
                  >
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "14px",
                        background: b.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={22} color="white" />
                    </div>
                    <div>
                      <h3
                        className="font-outfit"
                        style={{ fontSize: "17px", fontWeight: "700", color: "#0F172A", marginBottom: "6px" }}
                      >
                        {b.title}
                      </h3>
                      <p style={{ fontSize: "14px", color: "#64748B", lineHeight: "1.7", margin: 0 }}>
                        {b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: "#0F172A", padding: "100px 0" }}>
        <div className="max-w-6xl mx-auto px-6">
          <p style={{ fontSize: "13px", fontWeight: "600", color: "#14B8A6", textTransform: "uppercase", letterSpacing: "0.15em", textAlign: "center", marginBottom: "16px" }}>
            Real Numbers
          </p>
          <h2
            className="font-outfit"
            style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", color: "white", textAlign: "center", marginBottom: "56px", letterSpacing: "-0.02em" }}
          >
            What Early Creators Are Making
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            {STATS.map((s) => (
              <div
                key={s.label}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  padding: "36px 32px",
                  textAlign: "center",
                }}
              >
                <div
                  className="font-outfit"
                  style={{
                    fontSize: "clamp(40px, 5vw, 56px)",
                    fontWeight: "900",
                    letterSpacing: "-0.03em",
                    marginBottom: "12px",
                    background: "linear-gradient(135deg, #14B8A6, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.value}
                </div>
                <p style={{ fontSize: "16px", fontWeight: "600", color: "white", marginBottom: "8px" }}>{s.label}</p>
                <p style={{ fontSize: "13px", color: "#64748B" }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ background: "#F8F7F4", padding: "100px 0" }}>
        <div className="max-w-5xl mx-auto px-6">
          <p style={{ fontSize: "13px", fontWeight: "600", color: "#14B8A6", textTransform: "uppercase", letterSpacing: "0.15em", textAlign: "center", marginBottom: "16px" }}>
            Simple Process
          </p>
          <h2
            className="font-outfit"
            style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", color: "#0F172A", textAlign: "center", marginBottom: "16px", letterSpacing: "-0.02em" }}
          >
            How It Works
          </h2>
          <p style={{ fontSize: "17px", color: "#64748B", textAlign: "center", marginBottom: "64px" }}>
            Zero friction. Zero setup. Just money.
          </p>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "0", flexWrap: "wrap" }}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={{ display: "flex", alignItems: "flex-start", flex: "1 1 140px", minWidth: 0 }}>
                <div style={{ flex: 1, textAlign: "center", padding: "0 8px" }}>
                  <div
                    className="font-outfit"
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #14B8A6, #06b6d4)",
                      color: "white",
                      fontSize: "18px",
                      fontWeight: "800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                      boxShadow: "0 8px 20px rgba(20,184,166,0.3)",
                    }}
                  >
                    {step.num}
                  </div>
                  <h3 className="font-outfit" style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", marginBottom: "8px" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.6" }}>{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ display: "flex", alignItems: "center", paddingTop: "24px", flexShrink: 0 }}>
                    <ArrowRight size={18} color="#CBD5E1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: "white", padding: "100px 0" }}>
        <div className="max-w-3xl mx-auto px-6">
          <p style={{ fontSize: "13px", fontWeight: "600", color: "#14B8A6", textTransform: "uppercase", letterSpacing: "0.15em", textAlign: "center", marginBottom: "16px" }}>
            Got Questions?
          </p>
          <h2
            className="font-outfit"
            style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", color: "#0F172A", textAlign: "center", marginBottom: "48px", letterSpacing: "-0.02em" }}
          >
            Frequently Asked Questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #14B8A6 0%, #06b6d4 50%, #0891b2 100%)",
          padding: "100px 0",
          textAlign: "center",
        }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2
            className="font-outfit"
            style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "900", color: "white", marginBottom: "20px", letterSpacing: "-0.03em", lineHeight: "1.1" }}
          >
            Ready to Start Earning?
          </h2>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.85)", marginBottom: "40px", lineHeight: "1.7" }}>
            Join <strong>847+</strong> creators already on the Leaky waitlist.
            <br />Get your $100 bonus when we launch.
          </p>
          <button
            onClick={scrollToForm}
            style={{
              padding: "18px 44px",
              borderRadius: "16px",
              fontSize: "17px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              letterSpacing: "-0.01em",
              background: "white",
              color: "#14B8A6",
              border: "2px solid white",
              transition: "all 0.2s ease",
            }}
            className="font-outfit"
          >
            Join Waitlist Now
            <ArrowRight size={20} />
          </button>
          <p style={{ marginTop: "20px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
            ✓ Free to join · No credit card required · You choose every request
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#0F172A", padding: "40px 0", textAlign: "center" }}>
        <div className="max-w-6xl mx-auto px-6">
          <span className="font-outfit" style={{ fontSize: "20px", fontWeight: "900", color: "#14B8A6", display: "block", marginBottom: "12px" }}>
            LEAKY
          </span>
          <p style={{ fontSize: "13px", color: "#475569" }}>© 2026 Leaky. All rights reserved.</p>
          <p style={{ fontSize: "13px", color: "#334155", marginTop: "4px" }}>
            Get paid for what you already do.
          </p>
        </div>
      </footer>
    </div>
  );
}
