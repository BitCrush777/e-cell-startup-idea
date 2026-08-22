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
        // Deep SaaS Dark Palette (Layered Depth)
        background: '#05070B',
        'surface-base': '#05070B',
        'surface-1': '#080B12',
        'surface-2': '#0D111A',
        'surface-3': '#121824',
        'surface-elevated': '#161E2E',
        'surface-border': 'rgba(255, 255, 255, 0.08)',
        'surface-border-hover': 'rgba(255, 255, 255, 0.16)',

        // Accent & Brand Colors
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#818CF8',
          subtle: 'rgba(99, 102, 241, 0.12)',
        },
        accent: {
          blue: '#38BDF8',
          indigo: '#6366F1',
          violet: '#A855F7',
          cyan: '#06B6D4',
        },
        'on-surface': '#F8FAFC',
        'on-surface-variant': '#94A3B8',
        'on-surface-muted': '#64748B',

        // Status Colors
        'status-success': '#10B981',
        'status-warning': '#F59E0B',
        'status-danger': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Geist', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        'mono-timer': ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 20px -5px rgba(99, 102, 241, 0.25)',
        'glow-md': '0 0 35px -8px rgba(99, 102, 241, 0.35)',
        'glow-lg': '0 0 60px -12px rgba(99, 102, 241, 0.45)',
        'glow-cyan': '0 0 30px -5px rgba(56, 189, 248, 0.3)',
        'card-layered': '0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'panel-elevated': '0 20px 40px -15px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up': 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'border-beam': 'borderBeam calc(var(--duration)*1s) infinite linear',
        'meteor-effect': 'meteor 5s linear infinite',
        'shimmer-slide': 'shimmerSlide var(--speed) ease-in-out infinite alternate',
        'spin-around': 'spinAround calc(var(--speed) * 2) infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        borderBeam: {
          '100%': {
            'offset-distance': '100%',
          },
        },
        meteor: {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': {
            transform: 'rotate(215deg) translateX(-500px)',
            opacity: '0',
          },
        },
        shimmerSlide: {
          to: {
            transform: 'translate(calc(100cqw - 100%), 0)',
          },
        },
        spinAround: {
          '0%': {
            transform: 'translateZ(0) rotate(0)',
          },
          '15%, 35%': {
            transform: 'translateZ(0) rotate(90deg)',
          },
          '65%, 85%': {
            transform: 'translateZ(0) rotate(270deg)',
          },
          '100%': {
            transform: 'translateZ(0) rotate(360deg)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
