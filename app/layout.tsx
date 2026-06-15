import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  verification: {
    google: 'a0klwKIDkie4dA9WGC_mGnxMIfnBoH0A8LS8jxQsevA',
  },
  title: "UHRATE — Decentralized Authenticity Network",
  description: "Verify whether any digital file is original, AI-generated, deepfaked, or manipulated. Powered by AI and blockchain technology.",
  keywords: "deepfake detection, AI content detection, document verification, blockchain authenticity, digital forensics, NFT certificates",
  authors: [{ name: "UHRATE" }],
  creator: "UHRATE",
  publisher: "UHRATE",
  metadataBase: new URL("https://uhrate.xyz"),
  openGraph: {
    title: "UHRATE — Is this file real or fake?",
    description: "AI-powered authenticity verification with blockchain proof. Detect deepfakes, AI-generated content, and document forgery.",
    url: "https://uhrate.xyz",
    siteName: "UHRATE",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UHRATE — Decentralized Authenticity Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UHRATE — Is this file real or fake?",
    description: "AI-powered authenticity verification with blockchain proof.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}