import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#8B2C82',
          accent: '#A855F7',
          bg: '#F7F2F6',
          surface: '#FFFFFF',
          fg: '#111827',
          muted: '#6B7280',
          soft: '#F3E8F2',
          dark: '#1A1228',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        box: '1.5rem',
        button: '999px',
      },
    },
  },
  plugins: [],
};

export default config;
