/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        prompt: ["'Prompt'", 'sans-serif'],
      },
      },
      keyframes: {
        'text-scale-fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'text-scale-fade-in': 'text-scale-fade-in 1.9s ease-out forwards',
      },
    },
  },
  plugins: [],
};
