/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        mine: {
          bg: '#0A1628',
          card: '#1A2A42',
          border: '#243352',
          cyan: '#00F0FF',
          cyanDark: '#00B8C4',
          amber: '#FFB800',
          red: '#FF3B3B',
          green: '#00D68F',
          blue: '#4A7BCC',
          text: '#E0E8F0',
          muted: '#7A8BA0',
        }
      },
      fontFamily: {
        din: ['DIN Alternate', 'Roboto Mono', 'monospace'],
        body: ['PingFang SC', 'Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
