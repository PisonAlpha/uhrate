import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
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
  title: "UHRATE — Permanent Blockchain Identity for Every Document",
  description: "Give any document, image, video or file a permanent blockchain identity. AI-powered authenticity verification with immutable on-chain proof.",
  keywords: "blockchain document identity, deepfake detection, AI content detection, document verification, blockchain authenticity, digital forensics, NFT certificates, document registry",
  authors: [{ name: "UHRATE" }],
  creator: "UHRATE",
  publisher: "UHRATE",
  metadataBase: new URL("https://uhrate.online"),
  openGraph: {
    title: "UHRATE — Permanent Blockchain Identity for Every Document",
    description: "Give any document a permanent, immutable blockchain identity. AI-powered verification with on-chain proof — verifiable by anyone, forever.",
    url: "https://uhrate.online",
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
    title: "UHRATE — Permanent Blockchain Identity for Every Document",
    description: "Give any document a permanent, immutable blockchain identity. AI-powered verification with on-chain proof.",
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
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WK8RSXJFVD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WK8RSXJFVD');
          `}
        </Script>

        {/* Structured Data — Organization */}
        <Script id="structured-data" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "UHRATE",
            "url": "https://uhrate.online",
            "logo": "https://uhrate.online/og-image.png",
            "description": "Decentralized authenticity network — permanent blockchain identity for every document.",
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "hello@uhrate.online",
              "contactType": "customer support"
            },
            "sameAs": [
              "https://x.com/uhrate_official",
              "https://t.me/uhrateofficial",
              "https://www.instagram.com/uhrate"
            ]
          })}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}