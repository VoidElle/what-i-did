/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:       "#0d0d10",
        surface:  { DEFAULT: "#17171b", 2: "#202026", hover: "#26262d" },
        bdr:      { DEFAULT: "#2e2e36", subtle: "#232329" },
        ink:      { DEFAULT: "#f0f0f4", muted: "#a8a8b4", faint: "#8c8c9c" },
        accent:   {
          DEFAULT: "#34d399",
          dim:     "rgba(52,211,153,0.09)",
          border:  "rgba(52,211,153,0.22)",
        },
        warn:     { DEFAULT: "#fbbf24", dim: "rgba(251,191,36,0.10)", border: "rgba(245,158,11,0.2)" },
        danger:   {
          text:   "#fc8181",
          bg:     "rgba(252,129,129,0.07)",
          border: "rgba(252,129,129,0.22)",
        },
      },
      fontFamily: {
        sans: ["'Geist Variable'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'Geist Mono Variable'", "'SF Mono'", "'Fira Code'", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "14px",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition:  "400px 0" },
        },
        "card-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "details-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },
      animation: {
        shimmer:    "shimmer 1.6s infinite",
        "card-in":  "card-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        "details-in": "details-in 0.2s ease",
      },
      width: { sidebar: "224px" },
      minWidth: { sidebar: "224px" },
    },
  },
  plugins: [],
}

