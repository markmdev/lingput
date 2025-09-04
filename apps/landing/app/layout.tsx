import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import GA from "./ga";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://lingput.dev"),
  title: "Lingput - Learn German with AI-Generated Stories",
  description:
    "Learn German with short, AI-generated stories tailored to your vocabulary level. Natural comprehensible input for English speakers with translations, audio, and smart word tracking.",
  keywords: [
    "learn german",
    "language learning",
    "comprehensible input",
    "AI stories",
    "german for english speakers",
    "vocabulary builder",
  ],
  openGraph: {
    title: "Lingput - Learn German with AI-Generated Stories",
    description:
      "Learn German with short, AI-generated stories tailored to your vocabulary level for English speakers.",
    url: "https://lingput.dev",
    siteName: "Lingput",
    images: [
      {
        url: "/logo_min.png",
        width: 1024,
        height: 366,
        alt: "Lingput Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lingput - Learn German with AI-Generated Stories",
    description: "Learn German with AI-generated stories tailored to your vocabulary level.",
    images: ["/logo_min.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
  authors: [{ name: "Mark Morgan", url: "https://markmdev.com" }],
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <GA id={process.env.NEXT_PUBLIC_GA_ID!} />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
