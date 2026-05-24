import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Betless brand colors
        brand: {
          black: '#0A0A0F',
          dark: '#111118',
          card: '#16161F',
          border: '#1E1E2E',
          green: {
            DEFAULT: '#00E676',
            dark: '#00C853',
            glow: 'rgba(0, 230, 118, 0.15)',
          },
          gold: {
            DEFAULT: '#FFD700',
            dark: '#FFA000',
            glow: 'rgba(255, 215, 0, 0.15)',
          },
          purple: '#7C3AED',
          blue: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #0A0A0F 0%, #111118 50%, #0A0A0F 100%)',
        'gradient-green': 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(22,22,31,0.8) 0%, rgba(16,16,24,0.9) 100%)',
        'glow-green': 'radial-gradient(ellipse at center, rgba(0,230,118,0.15) 0%, transparent 70%)',
        'glow-gold': 'radial-gradient(ellipse at center, rgba(255,215,0,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'rank-up': 'rankUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          from: { boxShadow: '0 0 5px rgba(0,230,118,0.3), 0 0 20px rgba(0,230,118,0.1)' },
          to: { boxShadow: '0 0 20px rgba(0,230,118,0.6), 0 0 40px rgba(0,230,118,0.2)' },
        },
        rankUp: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '60%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideIn: {
          from: { transform: 'translateX(-10px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'green-glow': '0 0 20px rgba(0, 230, 118, 0.3)',
        'gold-glow': '0 0 20px rgba(255, 215, 0, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};

export default config;
