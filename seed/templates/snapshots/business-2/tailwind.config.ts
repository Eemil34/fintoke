import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#9B2C2C',
          deep: '#7F1D1D',
          soft: '#F5E8E6',
          mist: '#FBEDEC',
        },
        ink: {
          DEFAULT: '#111111',
          soft: '#1F1F1F',
          muted: '#6B7280',
          faint: '#9CA3AF',
        },
        mist: {
          DEFAULT: '#F7F7F8',
          line: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '76rem',
      },
      boxShadow: {
        lift: '0 24px 48px rgba(17,17,17,0.12)',
        soft: '0 12px 28px rgba(17,17,17,0.08)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        underline: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        rise: 'rise 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'rise-delay': 'rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.12s both',
        'rise-delay-2': 'rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.22s both',
        'rise-delay-3': 'rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.32s both',
        fade: 'fade 0.9s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
