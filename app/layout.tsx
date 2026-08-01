import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Newsreader } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import Providers from "./providers";

// Self-hosted at build time by next/font — no runtime request to Google. Used
// sparingly (hero emphasis, section pull-quotes) as an editorial accent against
// the Geist sans, not as a body typeface.
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "PolyTeach — Competition prep that adapts to you.",
  description: "AI-powered Socratic coach for AMC, AIME, USAMO, USACO, USAPhO, and every major academic competition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${GeistSans.variable} ${GeistMono.variable} ${newsreader.variable}`}>
      <body className="h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
