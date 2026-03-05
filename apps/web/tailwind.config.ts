import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FFF0F5',
          100: '#FFD6E5',
          200: '#FFADC9',
          300: '#FF7BAD',
          400: '#FF4A8E',
          500: '#fd267a',   // Tinder pink
          600: '#e01560',
          700: '#b80f4d',
        },
        coral: {
          500: '#ff6036',   // Tinder coral/orange
          600: '#e84e26',
        },
        dark: {
          900: '#111418',   // Tinder dark
          800: '#1a1d24',
          700: '#24272f',
          600: '#2e323c',
        },
        app: {
          bg:      '#0a0a0c',
          surface: '#1c1c24',
          accent:  '#e63946',
        },
      },
      backgroundImage: {
        'tinder':         'linear-gradient(to top right, #fd267a, #ff6036)',
        'tinder-r':       'linear-gradient(to right, #fd267a, #ff6036)',
        'tinder-br':      'linear-gradient(to bottom right, #fd267a, #ff6036)',
        'tinder-subtle':  'linear-gradient(to top right, rgba(253,38,122,.15), rgba(255,96,54,.15))',
      },
      fontFamily: {
        sans:   ['var(--font-jakarta)', 'Proxima Nova', 'Helvetica Neue', 'Arial', 'sans-serif'],
        syne:   ['var(--font-syne)', 'ui-sans-serif', 'sans-serif'],
        dmsans: ['var(--font-dmsans)', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'card':        '0 4px 20px rgba(0,0,0,.3)',
        'card-hover':  '0 8px 40px rgba(0,0,0,.4)',
        'glow':        '0 0 40px rgba(253,38,122,.35)',
        'glow-sm':     '0 0 20px rgba(253,38,122,.25)',
        'accent-glow': '0 0 24px rgba(230,57,70,.45)',
      },
    },
  },
  plugins: [],
};

export default config;
