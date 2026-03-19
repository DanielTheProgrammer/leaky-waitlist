import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaky — Be the one getting mentioned.",
  description:
    "Get real story tags, comments, and features from creators you actually follow. Real engagement, no bots. Join the member waitlist.",
  openGraph: {
    title: "Leaky — Be the one getting mentioned.",
    description:
      "Get real story tags, comments, and features from creators. Real engagement, no bots.",
    url: "https://members.leaky.buzz",
    siteName: "Leaky",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaky — Be the one getting mentioned.",
    description: "Real story tags, comments, and features from creators. No bots.",
  },
  metadataBase: new URL("https://members.leaky.buzz"),
};

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
