import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#EDE4D4',
          soft: '#F5EEE3',
          deep: '#D9CFBC',
        },
        espresso: {
          DEFAULT: '#2A1810',
          deep: '#1A0F0A',
          mid: '#3D2418',
          light: '#5C3A28',
        },
        olive: {
          DEFAULT: '#9B8C5E',
          soft: '#B5A875',
          dark: '#6F6440',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.75' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s ease-out both',
        float: 'float 5s ease-in-out infinite',
        'soft-pulse': 'soft-pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
