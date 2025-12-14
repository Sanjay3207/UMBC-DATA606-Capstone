/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonPink: "#fb37ff",
        neonCyan: "#22d3ee",
        neonLime: "#a3e635",
      },
    },
  },
  plugins: [],
};
