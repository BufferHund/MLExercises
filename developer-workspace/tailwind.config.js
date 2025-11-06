/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007AFF',
          dark: '#0051D5',
          light: '#5AC8FA',
        },
        secondary: {
          DEFAULT: '#5856D6',
          dark: '#4838B0',
          light: '#AF52DE',
        },
        accent: {
          pink: '#FF2D55',
          orange: '#FF9500',
          yellow: '#FFCC00',
          green: '#34C759',
          teal: '#5AC8FA',
          indigo: '#5856D6',
          purple: '#AF52DE',
        }
      },
      borderRadius: {
        'xl': '1.25rem',    // 20px - macOS style
        '2xl': '1.75rem',   // 28px
        '3xl': '2.25rem',   // 36px
        '4xl': '2.75rem',   // 44px
        '5xl': '3.25rem',   // 52px - extra large for hero elements
      },
      backdropBlur: {
        'xs': '2px',
        '3xl': '40px',
        '4xl': '60px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.5)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'soft': '0 2px 16px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 4px 24px rgba(0, 0, 0, 0.12)',
        'soft-xl': '0 8px 40px rgba(0, 0, 0, 0.16)',
      },
      animation: {
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left': 'slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(40px) scale(0.98)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          },
        },
        slideDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-40px) scale(0.98)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          },
        },
        slideLeft: {
          '0%': {
            opacity: '0',
            transform: 'translateX(40px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        slideRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-40px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)'
          },
          '50%': {
            transform: 'translateY(-20px) rotate(2deg)'
          },
        },
        pulseSoft: {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
          '50%': {
            opacity: '0.9',
            transform: 'scale(1.02)'
          },
        },
        glow: {
          '0%': {
            boxShadow: '0 0 20px rgba(0, 122, 255, 0.3), 0 0 40px rgba(88, 86, 214, 0.2)',
          },
          '100%': {
            boxShadow: '0 0 30px rgba(0, 122, 255, 0.5), 0 0 60px rgba(88, 86, 214, 0.3)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-1000px 0',
          },
          '100%': {
            backgroundPosition: '1000px 0',
          },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
