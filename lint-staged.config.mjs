export default {
  "*.{js,mjs,ts,mts}": ["pnpm format:check", "pnpm lint:check"],
  "*.{json,yaml}": ["pnpm format:check"],
};
