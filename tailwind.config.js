/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta "panel de control nocturno de camaronera": agua oscura + bioluminiscencia teal.
        deep: {
          900: '#070F0D',
          800: '#0C1917',
          700: '#122421',
        },
        panel: {
          DEFAULT: '#0F1E1B',
          border: '#1E3733',
        },
        water: {
          400: '#5EEAD4',
          500: '#2DD4BF',
          600: '#14B8A6',
        },
        warn: '#E8A33D',
        alert: '#E85D4A',
        ink: {
          100: '#EAF4F1',
          300: '#B7CCC7',
          500: '#7C9992',
          700: '#4A615C',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
