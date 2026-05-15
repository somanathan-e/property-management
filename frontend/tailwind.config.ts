import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102033",
        steel: "#5b6b7f",
        cloud: "#eef3f8",
        panel: "#fbfdff",
        accent: "#1e5eff",
        success: "#0f9f6e",
        warn: "#dd8b18"
      },
      fontFamily: {
        sans: ["Segoe UI", "Helvetica Neue", "Arial", "sans-serif"]
      },
      boxShadow: {
        card: "0 20px 40px rgba(16, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

