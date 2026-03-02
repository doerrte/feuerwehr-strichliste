/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        feuerwehr: {
          red: "#C8102E",
          redDark: "#A50D25",

          dark: "#0B1220",
          darkSoft: "#111827",
          darkCard: "#1F2937",

          light: "#F8FAFC",
          lightCard: "#FFFFFF",

          borderLight: "#E5E7EB",
          borderDark: "rgba(255,255,255,0.08)",
        },
      },

      boxShadow: {
        premium: "0 20px 40px rgba(0,0,0,0.25)",
        soft: "0 8px 24px rgba(0,0,0,0.15)",
        glow: "0 0 20px rgba(200,16,46,0.35)",
      },

      borderRadius: {
        premium: "1.75rem",
      },

      backdropBlur: {
        xs: "2px",
      },

      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        slideUp: "slideUp 0.3s ease-out",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },

  plugins: [],
};