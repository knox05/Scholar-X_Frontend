/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#A084E8",
        lavenderLight: "#E5D9F2",
        softWhite: "#F8F7FF",
        darkText: "#2E2E3A",
      },
    },
  },
  plugins: [],
};