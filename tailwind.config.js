/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#1F1D1D',
          'black-soft': '#2A2828',
          'black-light': '#3A3838',
          pink: '#C2ADB8',
          'pink-light': '#D4C5CE',
          'pink-dark': '#A8909E',
          'pink-muted': '#C2ADB820',
          gold: '#B08D3C',
          'gold-light': '#C9A84C',
          'gold-dark': '#8E6F2E',
          'gold-muted': '#B08D3C20',
          white: '#FAF8F6',
          'off-white': '#F0EBE6',
          // Light theme tokens
          surface: '#FFFFFF',
          'surface-alt': '#FBF9F7',
          'surface-warm': '#F8F5F1',
          blush: '#F6EEEA',
          ink: '#333333',
          'ink-soft': '#6E6E6E',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #B08D3C 0%, #C9A84C 50%, #8E6F2E 100%)',
        'dark-gradient': 'linear-gradient(180deg, #1F1D1D 0%, #2A2828 100%)',
        'hero-overlay': 'linear-gradient(180deg, rgba(31,29,29,0.3) 0%, rgba(31,29,29,0.8) 100%)',
        'hero-light': 'linear-gradient(160deg, #FFFFFF 0%, #F8F5F1 60%, #F6EEEA 100%)',
      },
      boxShadow: {
        'gold': '0 0 0 1px #B08D3C',
        'gold-lg': '0 4px 24px rgba(176,141,60,0.2)',
        'pink': '0 4px 24px rgba(194,173,184,0.15)',
        'premium': '0 8px 48px rgba(0,0,0,0.4)',
        'card': '0 12px 40px rgba(0,0,0,0.05)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.08)',
        'nav': '0 2px 20px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
