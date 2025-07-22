import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import svelte3 from "eslint-plugin-svelte3";
import svelteParser from "svelte-eslint-parser";
import unusedImports from "eslint-plugin-unused-imports";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended, prettier],
    plugins: {
      prettier: prettierPlugin,
      "unused-imports": unusedImports,
      svelte3: svelte3,
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "prettier/prettier": ["error", {}, { usePrettierrc: true }],
      "no-console": "warn",
      "no-debugger": "error",
      "no-alert": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-throw-literal": "error",
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      "no-duplicate-imports": "error",
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "no-multiple-empty-lines": ["error", { max: 2 }],
      "no-trailing-spaces": "error",
      "comma-dangle": ["error", "always-multiline"],
      quotes: ["error", "double", { avoidEscape: true }],
      semi: ["error", "always"],
      "no-prototype-builtins": "error",
      "no-constructor-return": "error",
      "no-promise-executor-return": "error",
      "no-async-promise-executor": "error",
      "array-callback-return": "error",
      "consistent-return": "error",
      "default-case": "error",
      "dot-notation": "error",
      "guard-for-in": "error",
      "no-caller": "error",
      "no-else-return": "error",
      "no-empty-function": "warn",
      "no-lone-blocks": "error",
      "no-loop-func": "error",
      "no-magic-numbers": [
        "warn",
        {
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
        },
      ],
      "no-param-reassign": ["error", { props: false }],
      "no-return-assign": "error",
      "no-self-compare": "error",
      "no-sequences": "error",
      "no-unmodified-loop-condition": "error",
      "no-unused-labels": "error",
      "no-useless-call": "error",
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "prefer-spread": "error",
      radix: "error",
      yoda: "error",
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    settings: {},
  },
  {
    files: ["**/*.svelte"],
    plugins: {
      svelte3: svelte3,
    },
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        extraFileExtensions: [".svelte"],
        project: "./tsconfig.json",
      },
    },
    processor: svelte3.processors.svelte,
    rules: {},
  },
]);
