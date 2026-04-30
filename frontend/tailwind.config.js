/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark Sidebar
        "sidebar":               "#0b0f10",

        // Material Design 3 surface tokens (from ui-design.json)
        "background":            "#f7f9fb",
        "surface":               "#f7f9fb",
        "surface-bright":        "#f7f9fb",
        "surface-dim":           "#cfdce3",
        "surface-variant":       "#d9e4ea",
        "surface-container-lowest": "#ffffff",
        "surface-container-low":    "#f0f4f7",
        "surface-container":        "#e8eff3",
        "surface-container-high":   "#e1e9ee",
        "surface-container-highest":"#d9e4ea",
        "surface-tint":          "#545f73",
        "inverse-surface":       "#0b0f10",
        "inverse-on-surface":    "#9a9d9f",

        // Primary palette
        "primary":               "#545f73",
        "primary-dim":           "#485367",
        "primary-fixed":         "#d8e3fb",
        "primary-fixed-dim":     "#cad5ed",
        "primary-container":     "#d8e3fb",
        "inverse-primary":       "#dae6fe",
        "on-primary":            "#f6f7ff",
        "on-primary-fixed":      "#354053",
        "on-primary-fixed-variant": "#515c70",
        "on-primary-container":  "#475266",

        // Secondary palette
        "secondary":             "#526075",
        "secondary-dim":         "#465469",
        "secondary-fixed":       "#d5e3fd",
        "secondary-fixed-dim":   "#c7d5ee",
        "secondary-container":   "#d5e3fd",
        "on-secondary":          "#f8f8ff",
        "on-secondary-fixed":    "#324054",
        "on-secondary-fixed-variant": "#4e5c71",
        "on-secondary-container":"#455367",

        // Tertiary palette (blue accent)
        "tertiary":              "#006592",
        "tertiary-dim":          "#005980",
        "tertiary-fixed":        "#34b5fa",
        "tertiary-fixed-dim":    "#17a8ec",
        "tertiary-container":    "#34b5fa",
        "on-tertiary":           "#f5f9ff",
        "on-tertiary-fixed":     "#00121e",
        "on-tertiary-fixed-variant": "#003954",
        "on-tertiary-container": "#003047",

        // Surface foregrounds
        "on-surface":            "#2a3439",
        "on-surface-variant":    "#566166",
        "on-background":         "#2a3439",

        // Outline
        "outline":               "#717c82",
        "outline-variant":       "#a9b4b9",

        // Error
        "error":                 "#9f403d",
        "error-dim":             "#4e0309",
        "error-container":       "#fe8983",
        "on-error":              "#fff7f6",
        "on-error-container":    "#752121",
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body:     ["Inter", "sans-serif"],
        label:    ["Inter", "sans-serif"],
        manrope:  ["Manrope", "sans-serif"],
        inter:    ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg:      "0.5rem",
        xl:      "0.75rem",
        "2xl":   "1rem",
        "3xl":   "1.5rem",
        "4xl":   "2rem",
        full:    "9999px",
      },
      boxShadow: {
        card:    "0 12px 32px -4px rgba(42,52,57,0.06)",
        "card-sm":"0 12px 32px -4px rgba(42,52,57,0.04)",
      },
    },
  },
  plugins: [],
};
