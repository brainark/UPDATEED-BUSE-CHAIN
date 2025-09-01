/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brainark: {
          50: '#f4f7ff',
          100: '#e9efff',
          200: '#c9d7ff',
          300: '#a9bfff',
          400: '#6f95ff',
          500: '#3b6df7',
          600: '#2f56c4',
          700: '#233f92',
          800: '#172860',
          900: '#0c1330',
        },
        'deep-black': '#080808',
      },
      backgroundImage: {
        'brainark-gradient': 'linear-gradient(135deg, #3b6df7 0%, #233f92 100%)',
        'hero-pattern': 'radial-gradient(circle at 30% 30%, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
        'glow-pattern': 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0) 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
