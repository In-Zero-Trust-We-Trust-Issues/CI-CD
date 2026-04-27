/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'dark',
    'light',
    'bg-gray-900',
    'bg-gray-50',
    'text-white',
    'text-gray-900',
    'dark:bg-gray-900',
    'dark:bg-gray-800',
    'dark:text-white',
    'dark:text-gray-100',
    'dark:border-gray-600',
    'dark:border-gray-700'
  ]
}
