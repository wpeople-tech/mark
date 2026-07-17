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
  title: "MARK",
  description:
    "Scan any GitHub repo in 30 seconds. Get a full intelligence report + 3 pump.fun-ready utility website ideas.",
  openGraph: {
    title: "MARK Intelligence",
    description:
      "Scan any GitHub repo. Get 3 pump.fun-ready ideas.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    url: "https://markintel.tech",
  },
  twitter: {
    card: "summary_large_image",
    title: "MARK Intelligence",
    description: "Read any repo. Find your next build.",
    images: ["/og-image.png"],
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
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
