import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "PolyTeach — AI Study Coach",
  description: "Socratic AI coaching for AMC, AIME, USACO, AP courses, and every major academic competition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
