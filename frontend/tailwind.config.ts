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
        primary: {
          DEFAULT: "#e74c3c",
          dark: "#c0392b",
          light: "#ff6b5b",
        },
        secondary: {
          DEFAULT: "#3498db",
          dark: "#2980b9",
          light: "#5dade2",
        },
        khmer: {
          DEFAULT: "#1a5f7a",
          dark: "#0d3d4d",
          light: "#2d8ab8",
        },
      },
      fontFamily: {
        khmer: ["Kantumruy Pro", "sans-serif"],
        english: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
