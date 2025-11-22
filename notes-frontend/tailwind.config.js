/** @type {import('tailwindcss').Config} */

const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0E121A",
        "bg-secondary": "#171C26",
        "accent": "#326AFD",
        "text-high": "#E0E0E0",
        "text-low": "#899AC2",
      },
    },
  },
  plugins: [],
});

