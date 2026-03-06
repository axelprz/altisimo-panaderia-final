/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'bakery-cream': '#FDFBF7', 
        'bakery-brown': '#4A3728', // El marrón oscuro del texto y fondos premium
        'bakery-gold': '#C5A059',  // El dorado para detalles y botones
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}