/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222 47% 11%)",
        card: "hsl(0 0% 100%)",
        border: "hsl(214 32% 91%)",
        muted: "hsl(210 40% 96%)",
        "muted-foreground": "hsl(215 16% 47%)",
        primary: "hsl(222 47% 11%)",
        accent: "hsl(210 40% 96%)",
        success: "hsl(142 76% 36%)",
        danger: "hsl(0 84% 60%)",
        warning: "hsl(38 92% 50%)",
      },
    },
  },
  plugins: [],
};
