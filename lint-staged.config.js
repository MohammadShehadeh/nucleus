module.exports = {
  "*.{js,ts,tsx,json,md,css,scss}": ["pnpm format:fix"],
  "*.{js,ts,tsx}": ["pnpm lint:fix"],
};
