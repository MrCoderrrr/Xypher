/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0A0F1E",
        "bg-secondary": "#111827",
        "bg-card": "#0D1425",
        "bg-elevated": "#111827",
        accent: "#6366F1",
        cyan: "#06B6D4",
        "text-primary": "#F1F5F9",
        "text-muted": "#64748B",
        border: "#1E2A3A",
        success: "#10B981",
        danger: "#EF4444",
      },
      fontFamily: {
        heading: ["Sora", "ui-sans-serif", "system-ui"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 28px rgba(99, 102, 241, 0.35)",
        card: "0 18px 60px rgba(0, 0, 0, 0.24)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-16px)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "fade-in": "fadeIn 260ms ease-out",
      },
    },
  },
  plugins: [],
};
