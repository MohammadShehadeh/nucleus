module.exports = {
  "*.{js,ts,tsx,md,scss,css,json}": ["biome format --write"],
  "*.{js,ts,tsx}": ["biome lint --write"],
};
