/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0b1220",
          900: "#0f172a",
          800: "#141d33"
        },
        brand: {
          600: "#4f46e5",
          500: "#6366f1",
          100: "#e0e7ff"
        }
      }
    }
  },
  plugins: []
};
