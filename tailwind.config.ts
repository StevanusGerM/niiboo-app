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
        // Supporting palette — used for categories, rewards and success states.
        mint: { DEFAULT: "#3CCFA4", dark: "#22A882", light: "#D7F7EC" }, // success · writing · Hanzi
        ocean: { DEFAULT: "#5AB4F5", dark: "#2F8FD6", light: "#DDEFFD" }, // listening · info · practice
        lilac: { DEFAULT: "#A78BFA", dark: "#7C5CE8", light: "#EDE7FF" }, // reading · stories
        sunny: { DEFAULT: "#FFC94A", dark: "#E9A825", light: "#FFF3CF" }, // stars · XP · rewards
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
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
        // Chunky "3D" button bottoms
        "chunky-pink": "0 5px 0 0 #D9435F",
        "chunky-plum": "0 5px 0 0 #15161F",
        "chunky-white": "0 5px 0 0 rgba(43, 45, 66, 0.15)",
        "chunky-mint": "0 5px 0 0 #22A882",
        "chunky-ocean": "0 5px 0 0 #2F8FD6",
        "chunky-lilac": "0 5px 0 0 #7C5CE8",
        "chunky-sunny": "0 5px 0 0 #E9A825",
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
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(var(--r, 0deg))" },
          "50%": { transform: "translateY(-14px) rotate(var(--r, 0deg))" },
        },
        wave: {
          "0%, 60%, 100%": { transform: "rotate(0deg)" },
          "15%, 45%": { transform: "rotate(-22deg)" },
          "30%": { transform: "rotate(8deg)" },
        },
        blink: {
          "0%, 92%, 100%": { transform: "scaleY(1)" },
          "95%": { transform: "scaleY(0.1)" },
        },
        "bubble-in": {
          "0%": { transform: "scale(0.6) translateY(8px)", opacity: "0" },
          "70%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-6px)" },
          "40%, 80%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.25s ease-out",
        float: "float 3.2s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        wave: "wave 2.4s ease-in-out infinite",
        blink: "blink 4.5s ease-in-out infinite",
        "bubble-in": "bubble-in 0.45s cubic-bezier(.2,.9,.3,1.3) both",
        shake: "shake 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
