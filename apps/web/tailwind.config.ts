import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body:    ['var(--font-dmsans)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-dmsans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        'match-green': {
          DEFAULT:    'hsl(var(--match-green))',
          foreground: 'hsl(var(--match-green-foreground))',
        },
        'left-shoe':  'hsl(var(--left-shoe))',
        'right-shoe': 'hsl(var(--right-shoe))',
      },
      borderRadius: {
        xl:  'calc(var(--radius) + 4px)',
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 4px)',
        '4xl': '2rem',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'blob-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':      { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%':      { transform: 'translate(-15px, 15px) scale(0.95)' },
        },
        'blob-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':      { transform: 'translate(-20px, 20px) scale(1.1)' },
          '66%':      { transform: 'translate(25px, -10px) scale(0.9)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.6)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%':      { transform: 'translateX(-8px)' },
          '30%':      { transform: 'translateX(8px)' },
          '45%':      { transform: 'translateX(-6px)' },
          '60%':      { transform: 'translateX(6px)' },
          '75%':      { transform: 'translateX(-4px)' },
          '90%':      { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'fade-in':    'fade-in 0.4s ease-out forwards',
        'scale-in':   'scale-in 0.3s ease-out forwards',
        'slide-up':   'slide-up 0.5s ease-out forwards',
        float:        'float 4s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        marquee:      'marquee 30s linear infinite',
        'blob-1':     'blob-1 12s ease-in-out infinite',
        'blob-2':     'blob-2 15s ease-in-out infinite',
        'pop-in':     'pop-in 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
        shake:        'shake 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
