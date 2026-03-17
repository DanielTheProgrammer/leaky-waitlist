import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Leaky",
  description: "How Leaky collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div style={{ background: "#0A0A0F", minHeight: "100vh", color: "white" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "80px 24px 100px" }}>
        {/* Back */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#475569",
            textDecoration: "none",
            marginBottom: "48px",
          }}
        >
          ← Back to Leaky
        </Link>

        {/* Header */}
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: "900",
            letterSpacing: "-0.03em",
            marginBottom: "12px",
            color: "white",
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ fontSize: "14px", color: "#475569", marginBottom: "56px" }}>
          Last updated: March 2026
        </p>

        <div style={{ fontSize: "15px", color: "#94A3B8", lineHeight: "1.85" }}>
          {/* Introduction */}
          <Section title="1. Who We Are">
            <p>
              Leaky ("we", "us", "our") operates the waitlist at{" "}
              <strong style={{ color: "white" }}>leaky.buzz</strong>. We are a platform that connects
              creators with fans for paid social engagement.
            </p>
            <p style={{ marginTop: "12px" }}>
              For any privacy-related questions, contact us at:{" "}
              <a href="mailto:privacy@leaky.buzz" style={{ color: "#14B8A6" }}>
                privacy@leaky.buzz
              </a>
            </p>
          </Section>

          <Section title="2. What Data We Collect">
            <p>When you join the waitlist, we collect:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li><strong style={{ color: "white" }}>Full name</strong> — to personalise communications</li>
              <li><strong style={{ color: "white" }}>Email address</strong> — to notify you before launch and send your early access confirmation</li>
              <li><strong style={{ color: "white" }}>Instagram handle</strong> — to verify eligibility (2K+ followers required)</li>
              <li><strong style={{ color: "white" }}>TikTok handle</strong> (optional) — to understand your audience reach</li>
              <li><strong style={{ color: "white" }}>Follower count range</strong> — to segment the waitlist by creator tier</li>
              <li><strong style={{ color: "white" }}>Creator category</strong> — to personalise your early access experience</li>
            </ul>
            <p style={{ marginTop: "12px" }}>
              We also automatically collect your IP address for security purposes (rate limiting and
              abuse prevention). This is not stored long-term and is not linked to your profile.
            </p>
          </Section>

          <Section title="3. Why We Collect It (Legal Basis)">
            <p>We process your data for the following purposes:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>
                <strong style={{ color: "white" }}>Waitlist management</strong> — to register your interest and reserve your spot.
                Legal basis: <em>Legitimate interests</em> / <em>Pre-contractual steps</em>.
              </li>
              <li>
                <strong style={{ color: "white" }}>Launch notifications</strong> — to email you 48 hours before we open, as
                you requested when signing up. Legal basis: <em>Consent</em> (your sign-up constitutes consent to
                receive these communications).
              </li>
              <li>
                <strong style={{ color: "white" }}>Security</strong> — to prevent spam and abuse of the sign-up form.
                Legal basis: <em>Legitimate interests</em>.
              </li>
            </ul>
          </Section>

          <Section title="4. How We Store Your Data">
            <p>
              Waitlist submissions are stored securely in our database (Resend Audience). Data is
              processed within the European Union / United States in compliance with applicable data
              protection laws.
            </p>
            <p style={{ marginTop: "12px" }}>
              We retain waitlist data for a maximum of{" "}
              <strong style={{ color: "white" }}>12 months</strong> after collection, or until you
              request deletion, whichever comes first.
            </p>
          </Section>

          <Section title="5. Who We Share Your Data With">
            <p>We do not sell your data. We share it only with:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>
                <strong style={{ color: "white" }}>Resend</strong> (resend.com) — our email service provider, used to send
                your confirmation email and launch notification. Resend acts as a data processor
                under our instructions.
              </li>
              <li>
                <strong style={{ color: "white" }}>Vercel</strong> (vercel.com) — our hosting provider. Vercel may process
                request metadata (IP, headers) as part of hosting infrastructure.
              </li>
            </ul>
            <p style={{ marginTop: "12px" }}>
              Both providers are GDPR-compliant and operate under appropriate data processing
              agreements.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              We use a single functional cookie/localStorage key (<code style={{ color: "#14B8A6", background: "rgba(20,184,166,0.1)", padding: "2px 6px", borderRadius: "4px" }}>leaky_cookie_consent</code>) to
              remember that you have acknowledged this notice. No tracking cookies, advertising
              cookies, or analytics cookies are used on this site.
            </p>
          </Section>

          <Section title="7. Your Rights (GDPR)">
            <p>If you are located in the EEA, UK, or Switzerland, you have the right to:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li><strong style={{ color: "white" }}>Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong style={{ color: "white" }}>Rectification</strong> — ask us to correct inaccurate data</li>
              <li><strong style={{ color: "white" }}>Erasure</strong> — ask us to delete your data ("right to be forgotten")</li>
              <li><strong style={{ color: "white" }}>Restriction</strong> — ask us to restrict processing of your data</li>
              <li><strong style={{ color: "white" }}>Portability</strong> — receive your data in a machine-readable format</li>
              <li><strong style={{ color: "white" }}>Objection</strong> — object to processing based on legitimate interests</li>
              <li><strong style={{ color: "white" }}>Withdraw consent</strong> — unsubscribe at any time via the unsubscribe link in any email we send</li>
            </ul>
            <p style={{ marginTop: "12px" }}>
              To exercise any of these rights, email{" "}
              <a href="mailto:privacy@leaky.buzz" style={{ color: "#14B8A6" }}>
                privacy@leaky.buzz
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section title="8. Data Security">
            <p>
              We take reasonable technical and organisational measures to protect your data,
              including HTTPS encryption in transit, rate limiting, and bot detection on all
              submission forms. No method of transmission over the internet is 100% secure, and we
              cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              This service is not directed at children under 16. We do not knowingly collect data
              from anyone under 16. If you believe we have inadvertently collected data from a minor,
              contact us immediately at{" "}
              <a href="mailto:privacy@leaky.buzz" style={{ color: "#14B8A6" }}>
                privacy@leaky.buzz
              </a>
              .
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this policy from time to time. Changes will be posted on this page with
              an updated "Last updated" date. If changes are material, we will notify waitlist
              members by email.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions, concerns, or requests related to this policy:{" "}
              <a href="mailto:privacy@leaky.buzz" style={{ color: "#14B8A6" }}>
                privacy@leaky.buzz
              </a>
            </p>
          </Section>
        </div>

        {/* Back to home */}
        <div style={{ marginTop: "64px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: "#14B8A6",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            ← Back to Leaky
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "white",
          marginBottom: "16px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
