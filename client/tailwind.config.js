/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        "jakarta": ['"Plus Jakarta Sans"', 'sans-serif'],
        "inter": ['Inter', 'sans-serif'],
        "quicksand": ['Quicksand', 'sans-serif'],
        "poppins": ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}