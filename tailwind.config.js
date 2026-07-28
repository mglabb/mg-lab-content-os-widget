/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#161616",
        paper: "#fafaf9",
        line: "#e8e6e1",
      },
    },
  },
  plugins: [],
};
