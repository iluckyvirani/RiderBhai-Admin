/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#FFF5F0',
          100: '#FFEBE3',
          200: '#FFD8CB',
          300: '#FFBAA4',
          400: '#FF8C68',
          500: '#F15A24', // Primary Indian Orange
          600: '#E8380D',
          700: '#C42605',
          800: '#9C1F08',
          900: '#7E1D0C',
        },
        surface: {
          bg: '#F4F1EA',
          card: '#FFFFFF',
          dark: '#1C1C1C',
          darkcard: '#2A2A2A',
        },
        success: '#00A86B',
        warning: '#F59E0B',
        gold: '#F7C948',
      },
    },
  },
  plugins: [],
}
