/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores do documento 
        avivar: {
          tiffany: '#0ABAB5', 
          pink: '#FF69B4',
          dark: '#2D3748',
          light: '#F7FAFC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}