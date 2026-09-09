import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sift: {
          black: '#000000',
          ink: '#0a0a0a',
          card: '#141414',
          elevated: '#1a1a1a',
          border: '#262626',
          muted: '#8a8a8a',
          soft: '#b3b3b3',
          lime: '#d4ff45',
          'lime-dim': '#b8e600',
          glow: 'rgba(212, 255, 69, 0.35)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        lime: '0 0 40px rgba(212, 255, 0, 0.35), 0 0 80px rgba(212, 255, 0, 0.15)',
        'lime-sm': '0 0 24px rgba(212, 255, 0, 0.4)',
        card: '0 24px 80px -20px rgba(0, 0, 0, 0.7)',
        panel: '0 30px 100px -30px rgba(0, 0, 0, 0.85)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 24px rgba(212, 255, 0, 0.35)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 255, 0, 0.55)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
