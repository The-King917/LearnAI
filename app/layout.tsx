import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import "katex/dist/katex.min.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "PolyTeach — Competition prep that adapts to you.",
  description: "AI-powered Socratic coach for AMC, AIME, USAMO, USACO, USAPhO, and every major academic competition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${GeistMono.variable}`}>
      <body className="h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
