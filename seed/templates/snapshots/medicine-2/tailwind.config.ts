import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1f4e4e',
          accent: '#e8923a',
          soft: '#e8efef',
          bg: '#f7f8f6',
          surface: '#ffffff',
          fg: '#163838',
          muted: '#5a6f6f',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        box: '1.75rem',
        button: '999px',
      },
      boxShadow: {
        float: '0 24px 60px -20px rgba(31, 78, 78, 0.28)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'soft-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-up-delay': 'fade-up 0.7s ease-out 0.15s both',
        'fade-up-delay-2': 'fade-up 0.7s ease-out 0.3s both',
        'soft-pulse': 'soft-pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
