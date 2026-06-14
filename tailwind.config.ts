import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        jakarta: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── shadcn/ui CSS-variable tokens ────────────────────────────────────
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        card:        { DEFAULT: 'hsl(var(--card))',        foreground: 'hsl(var(--card-foreground))' },
        popover:     { DEFAULT: 'hsl(var(--popover))',     foreground: 'hsl(var(--popover-foreground))' },
        secondary:   { DEFAULT: 'hsl(var(--secondary))',   foreground: 'hsl(var(--secondary-foreground))' },
        muted:       { DEFAULT: 'hsl(var(--muted))',       foreground: 'hsl(var(--muted-foreground))' },
        accent:      { DEFAULT: 'hsl(var(--accent))',      foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },

        // ── Brand / Primary (indigo) — keeps numeric scale + adds DEFAULT ────
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        // ── Surface / Background ─────────────────────────────────────────────
        surface: {
          DEFAULT: '#FFFFFF',
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
        },
        // ── Sidebar ──────────────────────────────────────────────────────────
        sidebar: {
          bg:      '#0F172A',
          hover:   '#1E293B',
          active:  '#1E293B',
          border:  '#1E293B',
          text:    '#94A3B8',
          heading: '#CBD5E1',
        },
        // ── Restaurant legacy palette (storefront) ────────────────────────
        restaurant: {
          bg:      '#FFFAF0',
          'bg-alt':'#FFF8EA',
          primary: '#F5A142',
          heading: '#0D102B',
          body:    '#6B6B78',
          card:    '#FFFFFF',
        },
      },
      maxWidth: {
        content: '1180px',
      },
      borderRadius: {
        lg:   'var(--radius)',
        md:   'calc(var(--radius) - 2px)',
        sm:   'calc(var(--radius) - 4px)',
        card: '12px',
        btn:  '8px',
        xl2:  '16px',
        xl3:  '24px',
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md': '0 4px 12px rgba(0,0,0,0.08)',
        float:  '0 10px 40px rgba(0,0,0,0.12)',
        modal:  '0 20px 60px rgba(0,0,0,0.20)',
      },
      fontSize: {
        '2xs': ['11px', '16px'],
        xs:    ['12px', '16px'],
        sm:    ['13px', '20px'],
        base:  ['14px', '22px'],
        md:    ['15px', '24px'],
        lg:    ['16px', '26px'],
        xl:    ['18px', '28px'],
        '2xl': ['20px', '30px'],
        '3xl': ['24px', '32px'],
        '4xl': ['30px', '38px'],
        '5xl': ['36px', '44px'],
      },
      spacing: {
        '4.5':  '18px',
        '5.5':  '22px',
        '13':   '52px',
        '15':   '60px',
        '18':   '72px',
        '22':   '88px',
        sidebar: '240px',
        header:  '64px',
      },
      animation: {
        'fade-in':    'fadeIn 150ms ease-out',
        'slide-up':   'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'scale-in':   'scaleIn 150ms ease-out',
        'shimmer':    'shimmer 1.5s ease-in-out infinite',
        'spin-slow':  'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
