import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Generates the browser tab favicon — a teal water drop on a dark square.
// The drop shape represents "Leaky" (dripping = earning passively).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#0F0F14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="20"
          height="24"
          viewBox="0 0 20 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Classic teardrop: tip at top, circular bottom */}
          <path
            d="M10 1 C14 6, 18 11, 18 16 A8 8 0 0 1 2 16 C2 11, 6 6, 10 1 Z"
            fill="#14B8A6"
          />
          {/* Highlight — oval in upper-left of the drop for depth */}
          <ellipse
            cx="7"
            cy="13"
            rx="2"
            ry="3.5"
            fill="rgba(255,255,255,0.22)"
            transform="rotate(-15 7 13)"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
