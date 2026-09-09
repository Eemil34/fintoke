import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cue: {
          navy: '#050816',
          ink: '#0b1020',
          purple: '#6d5efc',
          'purple-bright': '#7c6cff',
          'purple-soft': '#8b7cff',
          mist: '#f4f5f8',
          line: '#e8eaf0',
          muted: '#8b90a0',
          slate: '#5c6378',
          quote: '#4a5fd9',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        dashboard: '0 40px 100px -20px rgba(5, 8, 22, 0.55), 0 20px 40px -24px rgba(109, 94, 252, 0.35)',
        card: '0 18px 50px -28px rgba(15, 23, 42, 0.18)',
        soft: '0 12px 40px -20px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-plane': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(-12deg)' },
          '50%': { transform: 'translate(8px, -14px) rotate(-8deg)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-plane': 'float-plane 5s ease-in-out infinite',
        'fade-up': 'fade-up 0.8s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
