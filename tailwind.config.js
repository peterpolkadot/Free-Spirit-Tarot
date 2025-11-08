
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        raleway: ['Raleway', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#7C3AED',
        secondary: '#4C1D95',
      },
    },
  },
  plugins: [],
};