import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F4C5C',
        accent: '#C6A75E',
        secondary: '#F5EFE6',
        'rose-gold': '#B76E79',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-poppins)', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(15, 76, 92, 0.08)',
        'soft-hover': '0 8px 30px rgba(15, 76, 92, 0.12)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C6A75E 0%, #B76E79 100%)',
        'fabric': `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
      },
    },
  },
  plugins: [],
};

export default config;
