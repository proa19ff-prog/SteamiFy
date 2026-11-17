/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        steam: {
          dark: "#171a21",
          darker: "#121418",
          darkest: "#0b0c0e",
          card: "#1e222b",
          border: "#2a2f3a",
          accent: "#1a9fff",
          accentHover: "#38a9ff",
          text: "#c6d4df",
          textMuted: "#8f98a0"
        }
      }
    },
  },
  plugins: [],
};
