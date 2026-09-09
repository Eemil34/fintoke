import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#EAE3D9',
          soft: '#F2EFE9',
          deep: '#DDD5C9',
          card: '#E2D7CB',
        },
        roast: {
          DEFAULT: '#2A1B14',
          mid: '#3D2A22',
          light: '#5C4336',
          muted: '#7A6356',
        },
        gold: {
          DEFAULT: '#C4A574',
          soft: '#D4BC94',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(1.06)' },
        },
        'shadow-breathe': {
          '0%, 100%': { opacity: '0.55', transform: 'scaleX(1)' },
          '50%': { opacity: '0.8', transform: 'scaleX(1.04)' },
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'arrow-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(4px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.9s ease-out both',
        'fade-in': 'fade-in 1s ease-out both',
        float: 'float 6.5s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
        'scale-in': 'scale-in 0.85s ease-out both',
        'glow-pulse': 'glow-pulse 7s ease-in-out infinite',
        'shadow-breathe': 'shadow-breathe 8s ease-in-out infinite',
        orbit: 'orbit 14s linear infinite',
        'arrow-bounce': 'arrow-bounce 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
