/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      animation: {
        gradient: 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          to: { 'background-position': '200% center' },
        },
      },
      fontFamily: {
        sans: ['"Geist Sans"', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },
    },
  },
  plugins: [],
  future: {
    // 防止未来变更导致问题
    respectDefaultRingColorOpacity: true,
    disableColorOpacityUtilities: true,
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
};
