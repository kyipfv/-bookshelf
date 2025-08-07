/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e88e5',
        'primary-dark': '#1565c0',
        'primary-light': '#42a5f5',
      }
    },
  },
  plugins: [],
}