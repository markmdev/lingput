import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // TODO: Replace with actual URL
  metadataBase: new URL("http://localhost:3000"),
  title: "Lingput - Learn German with AI-Generated Stories",
  description:
    "Learn German with short, AI-generated stories tailored to your vocabulary level. Natural comprehensible input for English speakers with translations, audio, and smart word tracking.",
  openGraph: {
    title: "Lingput - Learn German with AI-Generated Stories",
    description:
      "Learn German with short, AI-generated stories tailored to your vocabulary level for English speakers.",
    url: "https://lingput.com", // TODO: Replace with actual URL
    siteName: "Lingput",
    images: [
      {
        url: "/og-image.png", // TODO: Add actual OG image
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  keywords: [
    "learn german",
    "language learning",
    "comprehensible input",
    "AI stories",
    "german for english speakers",
    "vocabulary builder",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
