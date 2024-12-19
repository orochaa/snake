/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.tsx'],
  theme: {
    fontFamily: {
      rubik: ['Rubik', 'sans-serif'],
    },

    extend: {
      colors: {
        brown: {
          50: '#f5f0ed', // Lightest
          100: '#e8d5d1',
          200: '#d1b2a8',
          300: '#bc8f86',
          400: '#a66d65',
          500: '#5a4d49', // Base color
          600: '#4c3e3b',
          700: '#3e2f2d',
          800: '#302020',
          900: '#201010', // Darkest
        },
      },
    },
  },
  plugins: [],
}
