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
        background: "#020617",
        surface: "#0F172A",
        border: "#1E293B",
        "text-primary": "#FFFFFF",
        "text-muted": "#94A3B8",
        accent: "#06B6D4",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        "danger-dim": "#7F1D1D",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "count-up": "countUp 0.8s ease-out forwards",
        "pulse-ring": "pulseRing 2s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(6, 182, 212, 0.4)" },
          "70%": { boxShadow: "0 0 0 8px rgba(6, 182, 212, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(6, 182, 212, 0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(6, 182, 212, 0.2), 0 0 20px rgba(6, 182, 212, 0.1)" },
          "100%": { boxShadow: "0 0 10px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
