/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        agri: {
          bg: '#0A120C',
          surface1: '#122217',
          surface2: '#1A2F21',
          surface3: '#243D2C',
          primary: '#22C55E',
          primaryLight: '#4AE176',
          primaryDark: '#15803D',
          emerald: '#10B981',
          amber: '#F59E0B',
          orange: '#F97316',
          danger: '#EF4444',
          card: 'rgba(18, 34, 23, 0.85)',
          border: 'rgba(34, 197, 94, 0.2)',
          borderHover: 'rgba(34, 197, 94, 0.45)',
          muted: '#9CA3AF',
          text: '#F9FAFB'
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'scan': 'scan 2s linear infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        scan: {
          '0%': { top: '0%' },
          '50%': { top: '95%' },
          '100%': { top: '0%' }
        }
      }
    },
  },
  plugins: [],
}
