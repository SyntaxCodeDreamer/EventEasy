/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0B0F19",
          indigo: "#1E1B4B",
          purple: "#7C3AED",
          accent: "#8B5CF6",
          light: "#F8FAFC",
          card: "#111827",
          border: "#1F2937"
        }
      }
    },
  },
  plugins: [],
}

