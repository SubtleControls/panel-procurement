import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#1F4E79', dark: '#163A5A' },
      },
    },
  },
  plugins: [],
};

export default config;
