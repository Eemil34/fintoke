import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#07090e',
          soft: '#0d1118',
          card: '#121821',
          elev: '#171e29',
          line: '#243041',
        },
        electric: {
          DEFAULT: '#4f8cff',
          bright: '#7eb0ff',
          deep: '#2f6fe0',
          mist: 'rgba(79,140,255,0.12)',
        },
        mist: '#9aa6b8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Arial Narrow', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
