/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3f0',    // Cream - lightest
          100: '#e8e3db',   // Light cream
          200: '#d4ccc2',   // Lighter sage
          300: '#c0b5a9',   // Pale sage
          400: '#a89890',   // Medium sage
          500: '#597b6f',   // Sage - main
          600: '#4e2430',   // Burgundy - darker
          700: '#345044',   // Forest - darkest
          800: '#2a3e37',   // Very dark forest
          900: '#1f2d28',   // Almost black forest
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-noto-sans-arabic)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
