/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          deep: '#0F2D1F',
          mid: '#1A4731',
          sage: '#3B6E50',
          light: '#EAF2EC',
        },
        gold: {
          DEFAULT: '#C8960C',
          light: '#F5E9C8',
        },
        cream: {
          DEFAULT: '#F9F7F2',
          dark: '#EFECe4',
        },
      },
      fontFamily: {
        serif: ['Libre Baskerville', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
