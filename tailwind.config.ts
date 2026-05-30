import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#070707",
        charcoal: "#111111",
        gold: "#d7b46a",
        champagne: "#f4dfae"
      },
      boxShadow: {
        gold: "0 24px 80px rgba(215, 180, 106, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
