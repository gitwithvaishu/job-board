/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0B132B',
          800: '#16213E',
          700: '#1F2D50',
        },
        amber: {
          500: '#D98E3F',
          600: '#BD7530',
        },
        paper: '#F7F5F0',
        slate: {
          50: '#F4F4F2',
          100: '#E8E7E2',
          400: '#8A8A85',
          600: '#5C5C57',
        },
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
      },
    },
  },
  plugins: [],
};
