import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        accent: {
          DEFAULT: "#ea580c",
          light: "#f97316",
          dark: "#c2410c",
        },
        /* Design system Loja (Leroy Merlin) */
        lm: {
          green: "var(--lm-green)",
          "green-dark": "var(--lm-green-dark)",
          "green-700": "var(--lm-green-700)",
          bg: "var(--lm-bg)",
          surface: "var(--lm-surface)",
          "surface-alt": "var(--lm-surface-alt)",
          border: "var(--lm-border)",
          text: "var(--lm-text)",
          "text-muted": "var(--lm-text-muted)",
          "gray-100": "var(--lm-gray-100)",
          "gray-200": "var(--lm-gray-200)",
          "blue-900": "var(--lm-blue-900)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Segoe UI", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      maxWidth: {
        "lm-container": "var(--lm-container-max)",
        "lm-main": "var(--lm-main-max)",
      },
      borderRadius: {
        "lm-md": "var(--lm-radius-md)",
        "lm-lg": "var(--lm-radius-lg)",
      },
      boxShadow: {
        "lm-soft": "var(--lm-shadow-soft)",
        "lm-strong": "var(--lm-shadow-strong)",
      },
    },
  },
  plugins: [],
};

export default config;
