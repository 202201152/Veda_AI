/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F4522D',
          dark: '#D93F1D',
          light: '#FEECE8',
          peach: '#F97862',
        },
        highlight: {
          green: '#3F9142',
          'green-light': '#EBF5EC',
          peach: '#F97862',
        },
        charcoal: {
          DEFAULT: '#333333',
          dark: '#1E1E1E',
          light: '#4A4A4A',
        },
        slate: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          'text-primary': '#0F172A',
          'text-secondary': '#64748B',
        },
        status: {
          success: '#3F9142',
          warning: '#F59E0B',
          error: '#DC4C3E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
