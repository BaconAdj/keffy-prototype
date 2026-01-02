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
        navy: '#1a2b4a',
        gold: '#c9a961',
        sand: '#f8f4ed',
        border: '#e8dcc8',
      },
      fontFamily: {
        vibes: ['Great Vibes', 'cursive'],
      },
    },
  },
  plugins: [],
};
export default config;
