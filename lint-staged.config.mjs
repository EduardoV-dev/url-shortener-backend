export default {
  "*.{js,ts}": ["pnpm format:check", "pnpm lint:check"],
  "*.{json,yaml}": ["pnpm format:check"],
};
