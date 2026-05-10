import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-forge-serif)", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        forge: {
          bg: "hsl(var(--forge-bg) / <alpha-value>)",
          surface: "hsl(var(--forge-surface) / <alpha-value>)",
          border: "hsl(var(--forge-border) / <alpha-value>)",
          muted: "hsl(var(--forge-muted) / <alpha-value>)",
          accent: "hsl(var(--forge-accent) / <alpha-value>)",
          danger: "hsl(var(--forge-danger) / <alpha-value>)",
        },
      },
      boxShadow: {
        panel: "none",
      },
    },
  },
  plugins: [],
};

export default config;
