import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F7F3EE',
          soft: '#FBF8F4',
          deep: '#EDE6DC',
        },
        ink: {
          DEFAULT: '#1A1410',
          soft: '#3A3028',
          muted: '#6B5E52',
        },
        bronze: {
          DEFAULT: '#8B6B4A',
          soft: '#A88968',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        brand: '0.28em',
        wideish: '0.18em',
      },
    },
  },
  plugins: [],
};

export default config;
