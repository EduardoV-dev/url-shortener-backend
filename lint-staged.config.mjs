export default {
  "*.{js,mjs,ts,mts}": ["pnpm format:check", "pnpm lint:check", "pnpm test"],
  "*.{json,yaml}": ["pnpm format:check"],
};
