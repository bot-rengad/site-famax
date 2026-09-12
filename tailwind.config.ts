import type { Config } from 'tailwindcss'

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
        // FMX Gaming Palette — design "FMx" (fond #060608, accent #FF1A1A)
        fmx: {
          black: '#060608',
          'black-light': '#0a0a0c',
          carbon: '#111113',
          'carbon-light': '#161619',
          border: '#232327',
          'border-light': '#2e2e33',
          red: '#FF1A1A',
          'red-dark': '#e50914',
          'red-glow': '#ff3333',
          white: '#F5F5F5',
          'white-dim': '#d1d5db',
          'white-muted': '#9aa0a8',
          gray: '#9aa0a8',
          'gray-dark': '#6b7280',
        },
        // Semantic colors
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        sans: ['var(--font-space)', 'system-ui', 'sans-serif'],
        display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['clamp(2.5rem, 6vw, 4rem)', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-md': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.2', fontWeight: '600' }],
        'display-sm': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-md': ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      boxShadow: {
        'neon-red': '0 0 20px rgba(255, 26, 26, 0.4), 0 0 40px rgba(255, 26, 26, 0.2), 0 0 60px rgba(255, 26, 26, 0.1)',
        'neon-red-sm': '0 0 10px rgba(255, 26, 26, 0.3), 0 0 20px rgba(255, 26, 26, 0.15)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-neon': 'linear-gradient(135deg, rgba(255, 26, 26, 0.15) 0%, transparent 50%, rgba(255, 26, 26, 0.1) 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(20, 20, 20, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%)',
        'gradient-border': 'linear-gradient(135deg, #ff1a1a 0%, #e50914 50%, #ff1a1a 100%)',
        'carbon-pattern': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
        'mesh-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 26, 26, 0.15), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(255, 26, 26, 0.1), transparent)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'slide-down': 'slide-down 0.4s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'border-flow': 'border-flow 3s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 26, 26, 0.4), 0 0 40px rgba(255, 26, 26, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 26, 26, 0.6), 0 0 60px rgba(255, 26, 26, 0.4), 0 0 80px rgba(255, 26, 26, 0.2)' },
        },
        'glow': {
          '0%': { textShadow: '0 0 10px rgba(255, 26, 26, 0.5), 0 0 20px rgba(255, 26, 26, 0.3)' },
          '100%': { textShadow: '0 0 20px rgba(255, 26, 26, 0.8), 0 0 40px rgba(255, 26, 26, 0.5), 0 0 60px rgba(255, 26, 26, 0.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      transitionTimingFunction: {
        'expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderWidth: {
        '1': '1px',
      },
    },
  },
  plugins: [],
}
export default config