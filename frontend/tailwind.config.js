/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'custom': '0px 4px 4px 0px #0000001F',
        'resume': '0 4px 8px rgba(0,0,0,0.1)',
      }
    },
  },
  plugins: [],
}

