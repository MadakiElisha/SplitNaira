import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141412",
        cream: "#f6f1e9",
        gold: "#c9922a",
        goldLight: "#f5c842",
        greenDeep: "#1a4a2e",
        greenMid: "#2d7a4f",
        greenLight: "#e8f5ee"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-serif", "Georgia"]
      },
      boxShadow: {
        soft: "0 20px 60px -40px rgba(20, 20, 18, 0.6)"
      }
    }
  },
  plugins: [typography]
};

export default config;
