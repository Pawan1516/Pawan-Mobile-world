/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        bg: '#060c18',
        card: '#131f35',
        border: '#1d3050',
        accent: '#00d4ff',
        green: '#00e676',
        yellow: '#ffd600',
        red: '#ff4455',
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
