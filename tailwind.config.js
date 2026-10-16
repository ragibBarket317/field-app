module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: '#126b58', dark: '#113b36', soft: '#e4f4ee', accent: '#e58732' } },
      boxShadow: { card: '0 8px 24px rgba(18,59,54,.07)' },
    },
  },
  plugins: [],
};
