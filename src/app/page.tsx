"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  DollarSign,
  TrendingUp,
  Users,
  Zap,
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
    icon: DollarSign,
    iconBg: "#14B8A6",
    title: "Passive Income",
    desc: "Earn $2,000–$5,000/month with minimal effort. Get paid for what you already do.",
  },
  {
    icon: TrendingUp,
    iconBg: "#06b6d4",
    title: "Grow Your Following",
    desc: "More engagement = more followers. Leaky drives real traffic to your profile.",
  },
  {
    icon: Users,
    iconBg: "#8B5CF6",
    title: "Join a Community",
    desc: "Connect with other creators. Share tips. Celebrate wins together.",
  },
  {
    icon: Zap,
    iconBg: "#F97316",
    title: "No Restrictions",
    desc: "Works alongside Cameo, OnlyFans, Patreon. You set your own prices.",
  },
];

const STATS = [
  {
    value: "$2,400",
    label: "Average Monthly Earnings",
    sub: "From 50–100 requests/month",
    gradient: "from-teal-400 to-cyan-400",
  },
  {
    value: "$8,500",
    label: "Highest Earner (30 days)",
    sub: "Model with 500K followers",
    gradient: "from-violet-400 to-purple-400",
  },
  {
    value: "5–10 min",
    label: "Time Per Request",
    sub: "Story, comment, or tag",
    gradient: "from-coral to-orange-400",
  },
];

const STEPS = [
  { num: "01", title: "Join", desc: "Sign up and set your prices" },
  { num: "02", title: "Get Requests", desc: "Fans request stories, comments, tags" },
  { num: "03", title: "Deliver", desc: "Post/comment/tag them (5–10 min)" },
  { num: "04", title: "Get Paid", desc: "Keep 75% of earnings" },
];

const FAQS = [
  {
    q: "What if I don't have many followers?",
    a: "No problem! Leaky works for creators with 10K+ followers. Your engagement rate matters more than follower count. Plus, Leaky helps you grow your following over time.",
  },
  {
    q: "Can I use Leaky alongside Cameo or OnlyFans?",
    a: "Absolutely! No exclusivity required. Leaky is just another revenue stream. Use it alongside whatever else you're doing — there are no restrictions.",
  },
  {
    q: "How much can I earn?",
    a: "It depends on your niche, follower count, and engagement. Most creators make $1,000–$5,000/month. Top creators make $10,000+/month. You set your own prices.",
  },
  {
    q: "When do I get paid?",
    a: "We pay weekly via bank transfer. You'll see money in your account within 1–3 business days of a fan confirming a deal is complete.",
  },
  {
    q: "What if I don't deliver a request?",
    a: "We handle all refunds and disputes. Your job is to deliver quality content. If there's an issue, we take care of the customer — you're protected.",
  },
];

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
      toast.success("🎉 You're on the waitlist! Check your email for next steps.");
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

  const errorStyle = {
    fontSize: "12px",
    color: "#EF4444",
    marginTop: "4px",
  };

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
          Check your email for confirmation. Your <strong style={{ color: "#14B8A6" }}>$100 launch bonus</strong> is locked in.
        </p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
          {["Keep 75%", "$100 Bonus", "Early Access"].map((badge) => (
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
        {/* Email */}
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

        {/* Instagram Handle */}
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

        {/* Followers */}
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
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.followers && <p style={errorStyle}>{errors.followers}</p>}
        </div>

        {/* Category */}
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
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.category && <p style={errorStyle}>{errors.category}</p>}
        </div>

        {/* Submit */}
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
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
  const [formSuccess, setFormSuccess] = useState(false);

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
          paddingTop: "140px",
          paddingBottom: "100px",
          overflow: "hidden",
          background: "#F8F7F4",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="hero-blob"
          style={{
            width: "500px",
            height: "500px",
            background: "rgba(20, 184, 166, 0.12)",
            top: "-100px",
            right: "-100px",
          }}
        />
        <div
          className="hero-blob"
          style={{
            width: "300px",
            height: "300px",
            background: "rgba(255, 107, 107, 0.08)",
            bottom: "0",
            left: "5%",
          }}
        />

        <div className="max-w-5xl mx-auto px-6 text-center" style={{ position: "relative", zIndex: 1 }}>
          {/* Pill */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#F0FDF9", border: "1px solid #CCFBF1", borderRadius: "100px", padding: "8px 16px", marginBottom: "28px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#14B8A6", display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#0F766E" }}>Early access — limited spots</span>
          </div>

          {/* Headline */}
          <h1
            className="font-outfit"
            style={{
              fontSize: "clamp(40px, 7vw, 76px)",
              fontWeight: "900",
              color: "#0F172A",
              lineHeight: "1.05",
              letterSpacing: "-0.03em",
              marginBottom: "24px",
              maxWidth: "820px",
              margin: "0 auto 24px",
            }}
          >
            Earn{" "}
            <span className="text-gradient-teal">$2,000–$5,000</span>
            <br />
            /month From Your Followers
          </h1>

          {/* Sub */}
          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "#475569",
              lineHeight: "1.7",
              maxWidth: "600px",
              margin: "0 auto 36px",
            }}
          >
            Join Leaky and get paid when fans request stories, comments, tags, and more.
            No exclusivity. No restrictions. Keep 75% of earnings.
          </p>

          {/* Trust badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginBottom: "44px" }}>
            {["Keep 75% of earnings", "No Exclusivity", "$100 Launch Bonus"].map((badge) => (
              <span
                key={badge}
                style={{
                  background: "white",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: "100px",
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0F172A",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                ✦ {badge}
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

          {/* Scroll cue */}
          <div style={{ marginTop: "60px" }}>
            <ChevronDown
              size={28}
              color="#CBD5E1"
              className="animate-bounce-slow"
              style={{ margin: "0 auto", display: "block" }}
            />
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </section>

      {/* ── Main Two-Column ── */}
      <section style={{ background: "#F8F7F4", paddingBottom: "100px" }}>
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
                marginBottom: "28px",
                letterSpacing: "-0.02em",
              }}
            >
              Why Join Leaky?
            </h2>
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
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
                <p style={{ fontSize: "16px", fontWeight: "600", color: "white", marginBottom: "8px" }}>
                  {s.label}
                </p>
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
            style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", color: "#0F172A", textAlign: "center", marginBottom: "64px", letterSpacing: "-0.02em" }}
          >
            How It Works
          </h2>

          {/* Desktop steps with connectors */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0" }}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={{ display: "flex", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
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
                    {i + 1}
                  </div>
                  <h3
                    className="font-outfit"
                    style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A", marginBottom: "10px" }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#64748B", lineHeight: "1.7" }}>{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ display: "flex", alignItems: "center", paddingTop: "24px", flexShrink: 0 }}>
                    <ArrowRight size={20} color="#CBD5E1" />
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
            Join <strong>847+</strong> creators on the Leaky waitlist.
            <br />Get $100 bonus when we launch.
          </p>
          <button
            onClick={scrollToForm}
            className="btn-teal-outline font-outfit"
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
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = "transparent";
              (e.target as HTMLButtonElement).style.color = "white";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = "white";
              (e.target as HTMLButtonElement).style.color = "#14B8A6";
            }}
          >
            Join Waitlist Now
            <ArrowRight size={20} />
          </button>
          <p style={{ marginTop: "20px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
            ✓ Free to join · No credit card required
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#0F172A", padding: "40px 0", textAlign: "center" }}>
        <div className="max-w-6xl mx-auto px-6">
          <span className="font-outfit" style={{ fontSize: "20px", fontWeight: "900", color: "#14B8A6", display: "block", marginBottom: "12px" }}>
            LEAKY
          </span>
          <p style={{ fontSize: "13px", color: "#475569" }}>
            © 2026 Leaky. All rights reserved.
          </p>
          <p style={{ fontSize: "13px", color: "#334155", marginTop: "4px" }}>
            For creators who want to monetize their influence.
          </p>
        </div>
      </footer>

      {/* Suppress unused var warning */}
      {formSuccess && null}
    </div>
  );
}
