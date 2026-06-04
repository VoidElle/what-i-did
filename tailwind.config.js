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
      transitionTimingFunction: {
        // Strong ease-out for UI interactions — starts fast, feels responsive
        ui:     "cubic-bezier(0.23, 1, 0.32, 1)",
        // Strong ease-in-out for on-screen movement
        inout:  "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition:  "400px 0" },
        },
        // Card entry: start from scale(0.98) — nothing appears from nothing
        "card-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        // Small fade-up for content swaps (e.g. copy button state transition)
        "fade-up": {
          from: { opacity: "0", transform: "translateY(3px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer:  "shimmer 1.6s linear infinite",
        "card-in": "card-in 280ms cubic-bezier(0.23, 1, 0.32, 1) both",
        "fade-up": "fade-up 150ms cubic-bezier(0.23, 1, 0.32, 1)",
      },
      width: { sidebar: "224px" },
      minWidth: { sidebar: "224px" },
    },
  },
  plugins: [],
}

