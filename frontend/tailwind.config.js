/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        forest: {
          50: '#f0f7f0',
          100: '#dceddc',
          200: '#bbdabc',
          300: '#8dc08f',
          400: '#5a9e5d',
          500: '#3a7d3e',
          600: '#2c6330',
          700: '#254f28',
          800: '#203f23',
          900: '#1a341e',
        },
        earth: {
          50: '#faf6f1',
          100: '#f0e8db',
          200: '#dfd0b8',
          300: '#c9b08e',
          400: '#b08d65',
          500: '#9a7348',
          600: '#7d5c38',
          700: '#644830',
          800: '#533c2c',
          900: '#453227',
        },
        cream: '#faf8f3',
      },
    },
  },
  plugins: [],
}
