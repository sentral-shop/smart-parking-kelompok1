/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warna custom untuk tema parking dashboard
        parking: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          accent: '#06b6d4',
          success: '#10b981',
          danger: '#ef4444',
          warn: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}