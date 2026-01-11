export default {
  '*.{ts,tsx,js,jsx}': ['pnpm exec eslint --fix'],
  '*.{json,md,yml,yaml}': ['pnpm exec prettier --write'],
};
