import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts}"],
    ...ts.configs.recommended,
  },
  {
    files: ["**/*.{ts}"],
    ...ts.configs.recommendedTypeChecked,
  },
  {
    files: ["**/*.{ts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": ts,
      prettier,
    },
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "prettier/prettier": "error",
    },
  },
  eslintConfigPrettier,
];
