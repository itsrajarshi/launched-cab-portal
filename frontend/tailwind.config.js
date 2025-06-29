/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media', // Use system/browser theme
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        fadein: "fadein 0.7s cubic-bezier(0.4,0,0.2,1)",
      },
      keyframes: {
        fadein: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
