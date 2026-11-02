import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#000000',
          secondary: '#08080D',
          card: '#0D0D12',
          elevated: '#12121A',
        },
        border: {
          subtle: '#252530',
          active: '#00F0FF',
        },
        accent: {
          primary: '#00F0FF',
          secondary: '#FF3D81',
          tertiary: '#B88AFF',
        },
        text: {
          main: '#F5F5F7',
          secondary: '#9292A3',
          muted: '#5F5F70',
        },
        state: {
          success: '#4DDBA7',
          warning: '#FFB84D',
          danger: '#FF4D6D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
