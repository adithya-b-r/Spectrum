/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['sans-serif'], 
        "lato": ['Lato', 'sans-serif'],
        "roboto": ['Roboto', 'sans-serif'],
        "quicksand": ['Quicksand', 'sans-serif'],
        "poppins": ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}