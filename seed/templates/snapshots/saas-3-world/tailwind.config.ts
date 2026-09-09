import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#05070d',
        navy: '#0a1224',
        glow: '#3b82f6',
        'glow-bright': '#60a5fa',
        mist: '#a8b3c7',
        frost: '#e8eef8',
      },
      fontFamily: {
        display: ['var(--font-space)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 60px rgba(59, 130, 246, 0.35)',
        card: '0 0 0 1px rgba(148, 163, 184, 0.12), 0 24px 80px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'float-slow': 'float 7s ease-in-out infinite',
        'float-mid': 'float 5.5s ease-in-out infinite',
        'float-fast': 'float 4.5s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2.4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.25)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
