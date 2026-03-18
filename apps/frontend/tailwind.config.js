/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Factory.ai inspired color palette
        accent: {
          DEFAULT: '#ff6b35', // Orange accent
          50: '#fff0ea',
          100: '#ffe0d4',
          200: '#ffc1a9',
          300: '#ff9f7c',
          400: '#ff7f4e',
          500: '#ff6b35',
          600: '#e55a2a',
          700: '#c34b20',
          800: '#a33d18',
          900: '#843210',
        },
        gray: {
          50: '#f8f9fa', // Off-white background
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d', // Text secondary
          700: '#495057',
          800: '#343a40',
          900: '#212529', // Text primary
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'display-sm': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        'heading-xl': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'heading-lg': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'heading': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'md': '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
        'lg': '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
        'xl': '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
}
