import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#c4956a',
          accent: '#e8d4b8',
          bg: '#0a0908',
          surface: '#161310',
          fg: '#f5f0eb',
          muted: '#9c9084',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Georgia', 'serif'],
      },
      borderRadius: {
        box: '3px',
        button: '3px',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(ellipse 80% 60% at 70% 40%, rgba(196, 149, 106, 0.25) 0%, transparent 70%)',
        'hero-warm':
          'linear-gradient(135deg, rgba(196, 149, 106, 0.35) 0%, rgba(22, 19, 16, 0.95) 55%, #0a0908 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
