import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1c1c1c',
          accent: '#3d4a52',
          bg: '#f5f3ef',
          surface: '#ebe8e1',
          fg: '#1c1c1c',
          muted: '#6b6560',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      borderRadius: {
        box: '0.25rem',
        button: '999px',
      },
    },
  },
  plugins: [],
};

export default config;
