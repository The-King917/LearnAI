import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#141414",
        "surface-2": "#1C1C1C",
        "surface-3": "#242424",
        border: "#2A2A2A",
        "border-2": "#363636",
        "border-3": "#404040",
        text: "#F0F0F0",
        "text-2": "#9B9B9B",
        muted: "#666666",
        subtle: "#333333",
        accent: "#E8A820",
        "accent-hover": "#F0AA22",
        "accent-muted": "rgba(232, 168, 32, 0.08)",
        disabled: "#2A2A2A",
        "disabled-text": "#444444",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.16), 0 0 28px rgba(255,255,255,0.10)",
        panel: "0 12px 40px rgba(0,0,0,0.55)",
        card: "0 4px 40px rgba(0,0,0,0.4)",
        "card-accent": "0 4px 40px rgba(0,0,0,0.45), 0 0 40px rgba(232,168,32,0.08)",
        // Layered, Stripe/Linear-style depth: a tight contact shadow, a mid-range
        // ambient shadow, and a soft long-throw shadow — reads as physical elevation
        // rather than a single flat drop shadow.
        elevated: "0 1px 1px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.22), 0 20px 40px -12px rgba(0,0,0,0.4)",
        "elevated-hover": "0 1px 1px rgba(0,0,0,0.32), 0 8px 18px rgba(0,0,0,0.28), 0 32px 56px -16px rgba(0,0,0,0.5)",
        "elevated-accent": "0 1px 1px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.4), 0 40px 80px -20px rgba(0,0,0,0.55), 0 0 90px -24px rgba(232,168,32,0.3)",
        "button-primary": "inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.2), 0 6px 16px -4px rgba(232,168,32,0.35)",
        "button-primary-hover": "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.22), 0 10px 24px -4px rgba(232,168,32,0.45)",
      },
      backgroundImage: {
        "grain": "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
        // Soft multi-source mesh for hero depth — several diffuse light sources
        // rather than one flat blurred blob.
        "mesh-hero":
          "radial-gradient(ellipse 70% 42% at 50% 0%, rgba(232,168,32,0.09), transparent 65%), " +
          "radial-gradient(ellipse 38% 32% at 84% 22%, rgba(255,255,255,0.05), transparent 62%), " +
          "radial-gradient(ellipse 46% 36% at 14% 28%, rgba(232,168,32,0.045), transparent 65%)",
        // Same warm light source, toned down — reused at the top of every major
        // section so the hero's depth carries through the whole page instead of
        // stopping after the fold.
        "mesh-section": "radial-gradient(ellipse 65% 100% at 50% 0%, rgba(232,168,32,0.05), transparent 70%)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "monospace"],
        // Editorial accent, not a body face — used sparingly for emphasis (hero
        // accent line, pull-quotes) to break up an all-grotesque page.
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px", letterSpacing: "0.01em" }],
        xs: ["12px", { lineHeight: "18px", letterSpacing: "0.005em" }],
        sm: ["13px", { lineHeight: "21px" }],
        base: ["14.5px", { lineHeight: "24px" }],
        lg: ["16px", { lineHeight: "26px", letterSpacing: "-0.005em" }],
      },
    },
  },
  plugins: [],
};

export default config;
