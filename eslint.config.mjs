import js from "@eslint/js";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js, "simple-import-sort": simpleImportSort, import: importPlugin },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/no-unresolved": "error",
    },
  },
  // Spread the recommended TS configs!
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_", // Ignores unused function arguments starting with '_'
          varsIgnorePattern: "^_", // Ignores unused variables (excluding function arguments) starting with '_'
          caughtErrors: "none", // Optionally, ignore unused error variables in catch blocks
        },
      ],
    },
  },
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  prettierConfig,
  {
    ignores: ["**/prisma/migrations/**", "**/src/generated/**", "**/node_modules/**", "**/dist/**"],
  },
]);
