import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          white: "#FFFFFF",
          surface: "#F8FAFC",
          black: "#0A0A0A",
          blue: "#2563EB",
          "blue-dark": "#1D4ED8",
          "blue-light": "#DBEAFE",
        },
        primary: "#0A0A0A",
        ink: "#0A0A0A",
        "on-primary": "#ffffff",
        "canvas-light": "#ffffff",
        "canvas-cream": "#F8FAFC",
        "shade-30": "#d4d4d8",
        "shade-40": "#a1a1aa",
        "shade-50": "#71717a",
        hairline: "#e4e4e7",
      },
      borderRadius: {
        pill: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "Helvetica", "Arial", "sans-serif"],
        display: ["Inter", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
