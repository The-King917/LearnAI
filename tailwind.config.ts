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
      },
      backgroundImage: {
        "grain": "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["11px", "16px"],
        xs: ["12px", "18px"],
        sm: ["13px", "20px"],
        base: ["14px", "22px"],
        lg: ["15px", "24px"],
      },
    },
  },
  plugins: [],
};

export default config;
