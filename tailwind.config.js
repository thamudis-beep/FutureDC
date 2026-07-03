/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'rgb(var(--bg) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface) / <alpha-value>)',
          hover: 'rgb(var(--bg-hover) / <alpha-value>)',
          border: 'rgb(var(--bg-border) / <alpha-value>)',
          'border-light': 'rgb(var(--bg-border-light) / <alpha-value>)',
        },
        text: {
          DEFAULT: 'rgb(var(--text) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
          ghost: 'rgb(var(--text-ghost) / <alpha-value>)',
        },
        // Era accents — theme-reactive via CSS variables.
        era: {
          1: 'rgb(var(--e1) / <alpha-value>)',
          2: 'rgb(var(--e2) / <alpha-value>)',
          3: 'rgb(var(--e3) / <alpha-value>)',
        },
        dead: 'rgb(var(--dead) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['Barlow Condensed', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.75rem',  { lineHeight: '1.1rem' }],
        'xs':  ['0.875rem', { lineHeight: '1.3rem' }],
      },
    },
  },
  plugins: [],
}
