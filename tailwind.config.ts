import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: "oklch(98% 0.01 45)",
        ink:   "#003b6d",
        petal: "#ff8ab4",
        sage:  "#86a693",
        sun:   "#ffcc33",
      },
      fontFamily: {
        headline: ["var(--font-bricolage)", "sans-serif"],
        script:   ["var(--font-caveat)", "cursive"],
        tagline:  ["var(--font-apple)", "cursive"],
        sans:     ["var(--font-outfit)", "sans-serif"],
        jakarta:  ["var(--font-jakarta)", "sans-serif"],
      },
      animation: {
        "spin-slow":   "spin 8s linear infinite",
        float:         "float 4s ease-in-out infinite",
        "pulse-glow":  "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-6px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%":       { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
