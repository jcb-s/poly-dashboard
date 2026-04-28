/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: "hsl(var(--accent) / <alpha-value>)",
        success: "hsl(142 76% 36% / <alpha-value>)",
        danger: "hsl(0 84% 60% / <alpha-value>)",
        warning: "hsl(38 92% 50% / <alpha-value>)",
        primary: "hsl(var(--foreground) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
