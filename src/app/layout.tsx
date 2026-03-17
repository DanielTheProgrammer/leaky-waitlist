import type { Metadata } from "next";
import { Syne, Epilogue } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { PHProvider } from "./providers";
import "./globals.css";

const META_PIXEL_ID = "2978896455833639";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne-var",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue-var",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leaky — Get Paid For Your Influence",
  description:
    "Join Leaky and earn $2,000–$5,000/month from your followers. Get paid when fans request stories, comments, tags, and more. No exclusivity. Keep 75% of earnings.",
  openGraph: {
    title: "Leaky — Get Paid For Your Influence",
    description:
      "Earn $2,000–$5,000/month from your followers. No exclusivity. Keep 75%.",
    url: "https://leaky.buzz",
    siteName: "Leaky",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaky — Get Paid For Your Influence",
    description: "Earn $2,000–$5,000/month from your followers. Keep 75%.",
  },
  metadataBase: new URL("https://leaky.buzz"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${epilogue.variable}`}>
      <body>
        {/* ── Meta Pixel base code ─────────────────────────────────────────────
            strategy="afterInteractive" → loads after hydration, never twice.
            next/script deduplicates by id so re-renders are safe.          */}
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){
            if(f.fbq)return;
            n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
            t=b.createElement(e);t.async=!0;t.src=v;
            s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
          }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${META_PIXEL_ID}');
          fbq('track','PageView');
        `}</Script>
        {/* noscript fallback for users with JS disabled */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        <PHProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: "var(--font-epilogue-var), Epilogue, sans-serif",
                borderRadius: "12px",
              },
            }}
          />
        </PHProvider>
        <Analytics />
      </body>
    </html>
  );
}
