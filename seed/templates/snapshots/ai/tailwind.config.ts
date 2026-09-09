import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hr: {
          green: '#68e39d',
          'green-bright': '#3dff8b',
          'green-deep': '#1bd760',
          black: '#000000',
          ink: '#0a0a0a',
          card: '#141414',
          panel: '#1a1d26',
          muted: '#9ca3af',
          soft: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'green-glow':
          '0 0 0 1px rgba(104, 227, 157, 0.45), 0 0 28px rgba(61, 255, 139, 0.4), 0 12px 40px rgba(0, 0, 0, 0.45)',
        'icon-glow': '0 0 18px rgba(61, 255, 139, 0.65)',
        soft: '0 24px 60px -20px rgba(0, 0, 0, 0.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.7', filter: 'drop-shadow(0 0 8px rgba(61,255,139,0.7))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 16px rgba(61,255,139,1))' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-up-delay': 'fade-up 0.7s ease-out 0.12s both',
        'fade-up-delay-2': 'fade-up 0.7s ease-out 0.24s both',
        'pulse-glow': 'pulse-glow 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
