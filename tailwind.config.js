/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      dropShadow: {
        'custom': '1px 1px 20px rgba(60, 136, 189, 1)',
        'custom1': '1px 1px 50px rgba(60, 136, 189, 1)',
        'custom2': '1px 1px 50px rgba(81, 59, 189, 1)',
      },
      boxShadow: {
        'bluebg': '2px 2px 30px rgba(60, 136, 189, 1)',
      },
      screens:{
        'tab':'640px',
        'smallphone':'200px',
      },
      colors:{
        'llblue':'rgb(60, 136, 189)'
      }
    },
  },
  plugins: [],
};
