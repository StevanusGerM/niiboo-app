import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blossom: { DEFAULT: "#FF6584", dark: "#E94E6F", light: "#FF8FA6" },
        peach: "#FFB385",
        rose: "#FFD1DC",
        plum: { DEFAULT: "#2B2D42", soft: "#5C5F7A" },
        cream: "#F9F8F6",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        hanzi: ["var(--font-noto-sc)", "PingFang SC", "Microsoft YaHei", "sans-serif"],
      },
      borderRadius: {
        bento: "28px",
        "bento-lg": "32px",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(43, 45, 66, 0.18)",
        pop: "0 6px 0 0 rgba(43, 45, 66, 0.9)",
        glow: "0 10px 40px -10px rgba(255, 101, 132, 0.55)",
      },
      backgroundImage: {
        "blossom-gradient": "linear-gradient(135deg, #FF6584 0%, #FFB385 100%)",
        "rose-gradient": "linear-gradient(135deg, #FFD1DC 0%, #FFE6D6 100%)",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: { "pop-in": "pop-in 0.25s ease-out" },
    },
  },
  plugins: [],
};

export default config;
