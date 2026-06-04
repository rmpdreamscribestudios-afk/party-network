import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "party-navy": "#1A365D",
        "party-blue": "#3182CE",
        "party-teal": "#38B2AC",
        "party-green": "#22C55E",
        "party-gold": "#F59E0B",
        "party-soft": "#F8FAFC",
        obsidian: "#10213A",
        charcoal: "#132B49",
        gold: "#F59E0B",
        champagne: "#F8FAFC"
      },
      boxShadow: {
        gold: "0 24px 80px rgba(49, 130, 206, 0.2)",
        celebration: "0 18px 60px rgba(56, 178, 172, 0.24)",
        dashboard: "0 16px 48px rgba(26, 54, 93, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
