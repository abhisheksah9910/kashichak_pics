/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      colors: {
        terracotta: {
          50: '#fdf4f0',
          100: '#fbe4d9',
          200: '#f5c4ab',
          300: '#eea078',
          400: '#e37c4c',
          500: '#d15f2e',
          600: '#b04722',
          700: '#8c371c',
          800: '#6f2d1c',
          900: '#5c271b',
          950: '#3a1810',
        },
        ink: {
          950: '#100d0b',
        },
      },
      boxShadow: {
        soft: '0 8px 30px -8px rgba(90, 45, 20, 0.25)',
      },
    },
  },
  plugins: [],
};
