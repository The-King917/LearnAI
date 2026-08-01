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
        background: "#F7F4EE",
        surface: "#FFFFFF",
        "surface-2": "#FAF8F3",
        "surface-3": "#EFEAE0",
        border: "rgba(27,27,24,0.08)",
        "border-2": "rgba(27,27,24,0.12)",
        "border-3": "rgba(27,27,24,0.18)",
        text: "#1B1B18",
        "text-2": "#4A463F",
        muted: "#6B6558",
        subtle: "#8A8578",
        accent: "#1F3B73",
        "accent-hover": "#18305F",
        "accent-muted": "rgba(31,59,115,0.08)",
        "accent-tint": "#E7ECF5",
        disabled: "#EFEAE0",
        "disabled-text": "#ABA79A",
        ink: "#1B1B18",
        "ink-text": "#F7F4EE",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(31,59,115,0.16), 0 0 28px rgba(31,59,115,0.10)",
        panel: "0 12px 40px rgba(27,27,24,0.14)",
        card: "0 4px 40px rgba(27,27,24,0.08)",
        "card-accent": "0 4px 40px rgba(27,27,24,0.1), 0 0 40px rgba(31,59,115,0.08)",
        // Layered, Stripe/Linear-style depth: a tight contact shadow, a mid-range
        // ambient shadow, and a soft long-throw shadow — reads as physical elevation
        // rather than a single flat drop shadow.
        elevated: "0 1px 1px rgba(27,27,24,0.04), 0 4px 10px rgba(27,27,24,0.06), 0 20px 40px -12px rgba(27,27,24,0.16)",
        "elevated-hover": "0 1px 1px rgba(27,27,24,0.05), 0 8px 18px rgba(27,27,24,0.08), 0 32px 56px -16px rgba(27,27,24,0.2)",
        "elevated-accent": "0 1px 1px rgba(27,27,24,0.04), 0 8px 24px rgba(27,27,24,0.1), 0 40px 80px -20px rgba(27,27,24,0.2), 0 0 90px -24px rgba(31,59,115,0.25)",
        "button-primary": "inset 0 1px 0 rgba(255,255,255,0.12), 0 1px 2px rgba(27,27,24,0.15), 0 6px 16px -4px rgba(31,59,115,0.35)",
        "button-primary-hover": "inset 0 1px 0 rgba(255,255,255,0.14), 0 2px 4px rgba(27,27,24,0.18), 0 10px 24px -4px rgba(31,59,115,0.45)",
      },
      backgroundImage: {
        "grain": "radial-gradient(rgba(27,27,24,0.025) 1px, transparent 1px)",
        // Soft multi-source mesh for hero depth — several diffuse light sources
        // rather than one flat blurred blob.
        "mesh-hero":
          "radial-gradient(ellipse 70% 42% at 50% 0%, rgba(31,59,115,0.1), transparent 65%), " +
          "radial-gradient(ellipse 38% 32% at 84% 22%, rgba(31,59,115,0.05), transparent 62%), " +
          "radial-gradient(ellipse 46% 36% at 14% 28%, rgba(31,59,115,0.045), transparent 65%)",
        // Same multi-source mesh as the hero, at matching strength — reused at the
        // top of every major section so the hero's depth carries through the whole
        // page instead of stopping after the fold.
        "mesh-section":
          "radial-gradient(ellipse 75% 90% at 50% 0%, rgba(31,59,115,0.1), transparent 68%), " +
          "radial-gradient(ellipse 40% 55% at 85% 15%, rgba(31,59,115,0.05), transparent 62%), " +
          "radial-gradient(ellipse 48% 60% at 12% 20%, rgba(31,59,115,0.05), transparent 65%)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "monospace"],
        // Headline/editorial serif — used for h1-h4 and pull-quotes.
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
