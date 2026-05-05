import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Base JS/TS (shared only)
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { js },
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      sourceType: "module",
    },
  },

  // TypeScript shared rules
  ...tseslint.configs.recommended,

  // Backend only rules
  {
    files: ["apps/backend/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./apps/backend/tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
    },
  },
]);
