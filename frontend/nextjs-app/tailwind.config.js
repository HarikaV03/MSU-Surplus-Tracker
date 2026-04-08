/** @type {import('tailwindcss').Config} */
module.exports = {
  //  Tells Tailwind where to look for class names
  
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",       // App Router 
    "./pages/**/*.{js,ts,jsx,tsx}",     // Pages Router 
    "./components/**/*.{js,ts,jsx,tsx}",// Reusable UI components (e.g., Layout, cards)
  ],

  theme: {
    extend: {
      //  to customize design system
   
    },
  },

  plugins: [
    //  Tailwind plugins here 
    
  ],
}
