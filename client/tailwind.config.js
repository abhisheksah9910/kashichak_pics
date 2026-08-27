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
          50: 'rgb(var(--color-terracotta-50) / <alpha-value>)',
          100: 'rgb(var(--color-terracotta-100) / <alpha-value>)',
          200: 'rgb(var(--color-terracotta-200) / <alpha-value>)',
          300: 'rgb(var(--color-terracotta-300) / <alpha-value>)',
          400: 'rgb(var(--color-terracotta-400) / <alpha-value>)',
          500: 'rgb(var(--color-terracotta-500) / <alpha-value>)',
          600: 'rgb(var(--color-terracotta-600) / <alpha-value>)',
          700: 'rgb(var(--color-terracotta-700) / <alpha-value>)',
          800: 'rgb(var(--color-terracotta-800) / <alpha-value>)',
          900: 'rgb(var(--color-terracotta-900) / <alpha-value>)',
          950: 'rgb(var(--color-terracotta-950) / <alpha-value>)',
        },
        ink: {
          950: 'rgb(var(--color-ink-950) / <alpha-value>)',
        },
      },
      boxShadow: {
        soft: '0 8px 30px -8px rgba(90, 45, 20, 0.25)',
      },
    },
  },
  plugins: [],
};
