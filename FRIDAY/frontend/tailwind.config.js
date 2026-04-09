/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'friday-blue': '#00f3ff',
        'friday-dark': '#0a0f1a',
      },
      backgroundImage: {
        'hologram': 'radial-gradient(circle at center, rgba(0, 243, 255, 0.15) 0%, rgba(10, 15, 26, 1) 70%)',
      }
    },
  },
  plugins: [],
}
