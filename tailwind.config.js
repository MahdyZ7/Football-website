/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 42 School Brand Colors
        ft: {
          primary: "#00babc",
          secondary: "#00807e",
          accent: "#ff6b35",
          dark: "#1a1a1a",
        },
        // Theme-aware colors (will be overridden by CSS variables)
        theme: {
          bg: {
            primary: "var(--bg-primary)",
            secondary: "var(--bg-secondary)",
            card: "var(--bg-card)",
          },
          text: {
            primary: "var(--text-primary)",
            secondary: "var(--text-secondary)",
          },
          border: "var(--border-color)",
          button: {
            primary: "var(--button-primary)",
            hover: "var(--button-hover)",
          },
          nav: {
            bg: "var(--nav-bg)",
            hover: "var(--nav-hover)",
          },
          table: "var(--table-bg)",
          input: "var(--input-bg)",
        },
        // Status colors
        status: {
          paid: "var(--paid-bg)",
          unpaid: "var(--unpaid-bg)",
          waitlist: "var(--waitlist-txt)",
          registered: "var(--registered-txt)",
        },
      },
      spacing: {
        // Consistent spacing scale
        xs: "0.25rem",   // 4px
        sm: "0.5rem",    // 8px
        md: "1rem",      // 16px
        lg: "1.5rem",    // 24px
        xl: "2rem",      // 32px
        "2xl": "3rem",   // 48px
        "3xl": "4rem",   // 64px
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "25px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 4px 6px var(--shadow), 0 1px 3px rgba(0, 0, 0, 0.08)",
        md: "0 4px 6px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px rgba(0, 0, 0, 0.15)",
        "2xl": "0 4px 12px var(--shadow)",
        toast: "0 4px 12px var(--shadow)",
        card: "0 2px 4px var(--shadow)",
        button: "0 4px 8px rgba(0, 0, 0, 0.1)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "DM Sans", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        display: ["var(--font-display)", "Rajdhani", "Helvetica Neue", "sans-serif"],
      },
      keyframes: {
        slideIn: {
          from: {
            transform: "translateX(100%)",
            opacity: "0",
          },
          to: {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        bounce: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-8px)",
          },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out",
        bounce: "bounce 1s ease-in-out infinite",
        spin: "spin 1s linear infinite",
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
    },
  },
  plugins: [],
  // Enable dark mode with data-theme attribute
  darkMode: ['class', '[data-theme="dark"]'],
};
