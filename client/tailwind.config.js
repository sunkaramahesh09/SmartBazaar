/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C0191D',
          dark: '#8B1013',
          light: '#E63035',
          50: '#FFF0F0',
          100: '#FFD6D7',
          200: '#FFA8AA',
          500: '#C0191D',
          600: '#A0161A',
          700: '#8B1013',
          900: '#5C0B0D',
        },
        secondary: '#FFFFFF',
        dark: {
          DEFAULT: '#0F0F0F',
          50: '#1A1A1A',
          100: '#252525',
          200: '#2E2E2E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(192, 25, 29, 0.35)',
        'card': '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.14)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
};
