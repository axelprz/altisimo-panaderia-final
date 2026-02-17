/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'bakery-brown': '#5D4037',
        'bakery-gold': '#D4AF37',
        'bakery-cream': '#F9F7F2',
      },
      fontFamily: {
        'serif': ['"Playfair Display"', 'serif'],
        'sans': ['"Montserrat"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}