/** @type {import('tailwindcss').Config} */
// TailwindCSS configuration - TaskFlow ke design system ke liye
const path = require('path');
module.exports = {
  // Enforce light mode by using 'class' strategy and never adding 'dark' class
  darkMode: 'class',
  content: [
    path.join(__dirname, './pages/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, './components/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, './app/**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    extend: {
      // Custom colors - design system ke hisaab se
      colors: {
        primary: '#11d473',
        'background-light': '#f6f8f7',
        'background-dark': '#102219',
      },
      // Font family - Outfit use karenge for sleek minimal look
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
      },
      // Border radius values
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
