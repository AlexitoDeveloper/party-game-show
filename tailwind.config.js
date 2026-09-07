/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          dark: '#030712',
          card: '#0f172a',
          neonRed: '#EF4444',
          neonBlue: '#3B82F6',
          neonYellow: '#FACC15',
          neonGreen: '#22C55E',
          neonPurple: '#A855F7',
          neonOrange: '#F97316',
        }
      },
      fontFamily: {
        arcade: ['Righteous', 'Impact', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-red': '0 0 25px rgba(239, 68, 68, 0.6)',
        'neon-blue': '0 0 25px rgba(59, 130, 246, 0.6)',
        'neon-yellow': '0 0 25px rgba(234, 179, 8, 0.6)',
        'neon-green': '0 0 25px rgba(34, 197, 94, 0.6)',
        'neon-purple': '0 0 25px rgba(168, 85, 247, 0.6)',
        'neon-orange': '0 0 25px rgba(249, 115, 22, 0.6)',
        'neon-polar': '0 0 30px rgba(255, 255, 255, 0.65)',
        'neon-shadow': '0 0 25px rgba(148, 163, 184, 0.45)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'buzzer-flash': 'flash 0.5s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      }
    },
  },
  plugins: [],
}
