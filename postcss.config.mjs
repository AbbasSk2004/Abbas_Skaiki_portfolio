// Tailwind CSS v4 uses a dedicated PostCSS plugin. No autoprefixer needed —
// v4 handles vendor prefixing internally.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
