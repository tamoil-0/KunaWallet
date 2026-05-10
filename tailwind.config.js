/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#080C14",
          secondary: "#0D1526",
          tertiary: "#111D35",
        },
        accent: {
          gold: "#F5A623",
          "gold-dim": "#C47D0E",
          cyan: "#00D4FF",
          "cyan-dim": "#0099BB",
          green: "#00E5A0",
          "green-dim": "#00A872",
        },
        state: {
          success: "#00E5A0",
          warning: "#F5A623",
          error: "#FF4D6D",
          info: "#00D4FF",
        },
        text: {
          primary: "#F0F4FF",
          secondary: "#8892A4",
          muted: "#4A5568",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        xs: ["11px", { lineHeight: "1.4" }],
        sm: ["13px", { lineHeight: "1.5" }],
        base: ["15px", { lineHeight: "1.6" }],
        lg: ["18px", { lineHeight: "1.5" }],
        xl: ["22px", { lineHeight: "1.4" }],
        "2xl": ["28px", { lineHeight: "1.3" }],
        "3xl": ["36px", { lineHeight: "1.2" }],
        "4xl": ["48px", { lineHeight: "1.1" }],
        hero: ["64px", { lineHeight: "1.05" }],
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.4)",
        gold: "0 0 30px rgba(245, 166, 35, 0.2)",
        cyan: "0 0 30px rgba(0, 212, 255, 0.15)",
        "btn-gold": "0 4px 20px rgba(245,166,35,0.3)",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #F5A623 0%, #C47D0E 100%)",
        "gradient-dark": "linear-gradient(180deg, #080C14 0%, #0D1526 100%)",
        "gradient-card": "linear-gradient(145deg, #0D1526 0%, #111D35 100%)",
        "gradient-hero":
          "radial-gradient(ellipse at 30% 50%, rgba(245,166,35,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(0,212,255,0.06) 0%, transparent 50%)",
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 2.5s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(245, 166, 35, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(245, 166, 35, 0.5)" },
        },
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
