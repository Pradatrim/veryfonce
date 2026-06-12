import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FONCÉ brand — dark luxury with gold.
        paper: "#0a0a0a", // base background (ombre gradient overlays this)
        ink: "#f5efe4", // cream foreground text
        accent: "#d4af37", // gold
        "accent-bright": "#ecc960",
        "accent-deep": "#9a7d24",
        elevated: "#161616", // card surface
        soft: "#1f1f1f", // input / secondary surface
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};

export default config;
