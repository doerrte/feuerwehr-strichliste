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
          dark: "#111111",
          gray: "#1F1F1F",
          light: "#F4F4F4",
        },
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },

      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)",
        card: "0 8px 24px rgba(0,0,0,0.12)",
        premium: "0 20px 40px rgba(0,0,0,0.15)",
      },

      backdropBlur: {
        xs: "2px",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
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