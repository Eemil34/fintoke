import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f5c56',
          deep: '#0a3f3b',
          accent: '#1a7a72',
          soft: '#f3f7f6',
          bg: '#f7faf9',
          surface: '#ffffff',
          fg: '#14201f',
          muted: '#5b6b69',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      borderRadius: {
        box: '1.25rem',
        button: '999px',
      },
    },
  },
  plugins: [],
};

export default config;
