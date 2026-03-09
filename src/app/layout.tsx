import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { PHProvider } from "./providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit-var",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-var",
  weight: ["400", "500", "600"],
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
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body>
        <PHProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: "var(--font-inter-var), Inter, sans-serif",
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
