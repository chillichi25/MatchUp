/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#00B83F",
          dark: "#009F37",
          deep: "#00A638",
        },
        ink: {
          DEFAULT: "#07192D",
        },
      },
    },
  },
  plugins: [],
};
