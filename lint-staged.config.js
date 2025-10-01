module.exports = {
  "*.{js,ts,tsx,md,scss}": ["biome format --write"],
  "*.{js,ts,tsx}": ["biome lint --write"],
};
