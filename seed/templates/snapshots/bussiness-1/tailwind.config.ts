import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#B8F04A',
          soft: '#CFF86E',
          deep: '#96D62A',
          mist: 'rgba(184, 240, 74, 0.14)',
        },
        ember: {
          DEFAULT: '#D4894A',
          deep: '#B86A2E',
        },
        ink: {
          DEFAULT: '#0E1410',
          soft: '#171E19',
          muted: '#5E6A60',
          faint: '#8A948C',
        },
        mist: {
          DEFAULT: '#EEF1EA',
          soft: '#F5F7F1',
          line: '#DDE3D7',
        },
        gold: '#E0A83A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '74rem',
      },
      boxShadow: {
        lift: '0 22px 48px rgba(14,20,16,0.2)',
        card: '0 12px 32px rgba(14,20,16,0.14)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        rise: 'rise 0.75s cubic-bezier(0.22,1,0.36,1) both',
        'rise-delay': 'rise 0.75s cubic-bezier(0.22,1,0.36,1) 0.1s both',
        'rise-delay-2': 'rise 0.75s cubic-bezier(0.22,1,0.36,1) 0.2s both',
        'rise-delay-3': 'rise 0.75s cubic-bezier(0.22,1,0.36,1) 0.3s both',
        fade: 'fade 1s ease-out both',
        float: 'float 5.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
