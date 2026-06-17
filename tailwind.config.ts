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
        background: "#080808",
        surface: "#0E0E0E",
        "surface-2": "#161616",
        "surface-3": "#1F1F1F",
        border: "#1F1F1F",
        "border-2": "#2C2C2C",
        "border-3": "#383838",
        text: "#FFFFFF",
        "text-2": "#9B9B9B",
        muted: "#4F4F4F",
        subtle: "#2C2C2C",
        accent: "#5E6AD2",
        "accent-2": "#6872D8",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(94,106,210,0.4), 0 0 24px rgba(94,106,210,0.18)",
        panel: "0 12px 40px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "grain": "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "monospace"],
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
