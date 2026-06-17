import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "LearnAI — AI Study Coach",
  description: "Socratic AI coaching for AMC, AIME, USACO, AP courses, and every major academic competition.",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏆</text></svg>" },
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
