/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:       "#080809",
        surface:  { DEFAULT: "#111114", 2: "#1a1a1f", hover: "#202026" },
        bdr:      { DEFAULT: "#2a2a34", subtle: "#1e1e26" },
        ink:      { DEFAULT: "#ededf2", muted: "#9898a8", faint: "#5e5e72" },
        accent:   {
          DEFAULT: "#34d399",
          dim:     "rgba(52,211,153,0.08)",
          border:  "rgba(52,211,153,0.18)",
          glow:    "rgba(52,211,153,0.12)",
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
        sm:   "5px",
        DEFAULT: "9px",
        lg:   "13px",
        xl:   "16px",
        "2xl": "20px",
        "3xl": "26px",
      },
      transitionTimingFunction: {
        // Expo-out — feels instant, heavy deceleration
        ui:     "cubic-bezier(0.16, 1, 0.3, 1)",
        // Spring with subtle overshoot — for card reveals & popups
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        // In-out for symmetrical transitions
        inout:  "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      boxShadow: {
        // Ambient OLED glow: no hard edges, pure atmosphere
        "glow-accent": "0 0 0 1px rgba(52,211,153,0.16), 0 0 24px rgba(52,211,153,0.06)",
        "card":        "0 1px 0 rgba(255,255,255,0.03) inset, 0 -1px 0 rgba(0,0,0,0.4) inset",
        "card-hover":  "0 1px 0 rgba(255,255,255,0.05) inset, 0 -1px 0 rgba(0,0,0,0.4) inset, 0 4px 24px rgba(0,0,0,0.3)",
        "inset-top":   "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition:  "400px 0" },
        },
        "card-in": {
          from: { opacity: "0", transform: "translateY(10px) scale(0.985)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer:      "shimmer 1.6s linear infinite",
        "card-in":    "card-in 380ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-up":    "fade-up 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slide-down 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
      width: { sidebar: "220px" },
      minWidth: { sidebar: "220px" },
    },
  },
  plugins: [],
}

