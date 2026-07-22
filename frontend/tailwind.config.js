/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'sidebar-bg': '#0F172A',
        'sidebar-text': '#94A3B8',
        'sidebar-active': '#3B82F6',
        'content-bg': '#F8FAFC',
        'card-bg': '#FFFFFF',
        border: '#E2E8F0',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
