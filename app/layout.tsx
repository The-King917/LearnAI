import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import Providers from "./providers";

// Self-hosted at build time by next/font — no runtime request to Google.
const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

// Headline/editorial serif — used for h1-h4 and pull-quotes across the app.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "PolyTeach — Competition prep that adapts to you.",
  description: "AI-powered Socratic coach for AMC, AIME, USAMO, USACO, USAPhO, and every major academic competition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${publicSans.variable} ${GeistMono.variable} ${sourceSerif.variable}`}>
      <body className="h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
