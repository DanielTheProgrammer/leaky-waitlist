export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#07070F",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-epilogue-var), 'Epilogue', Arial, sans-serif",
      }}
    >
      {/* Ambient amber glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "400px",
          background:
            "radial-gradient(ellipse at center, rgba(240,165,0,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Center content */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontFamily: "var(--font-syne-var), 'Syne', Arial, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(48px, 10vw, 80px)",
            letterSpacing: "0.25em",
            color: "#F0A500",
            marginBottom: "24px",
          }}
        >
          LEAKY
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            maxWidth: "320px",
            height: "1px",
            background: "#1A1A2E",
            margin: "0 auto 32px",
          }}
        />

        {/* Headline */}
        <h1
          style={{
            fontFamily: "var(--font-syne-var), 'Syne', Arial, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(32px, 6vw, 48px)",
            color: "#EDEDFF",
            margin: "0 0 20px",
            lineHeight: 1.15,
          }}
        >
          By invitation only.
        </h1>

        {/* Body */}
        <p
          style={{
            fontSize: "18px",
            color: "#7A7A9E",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          If you were invited,
          <br />
          you already know
          <br />
          where to go.
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: "13px",
          color: "#4A4A6A",
        }}
      >
        © 2026 Leaky
      </div>
    </main>
  );
}
