import jsEslint from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tsEslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  jsEslint.configs.recommended,
  {
    files: ["**/*.mjs", "**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "no-undef": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsEslint.parser,
      ecmaVersion: "latest",
      parserOptions: {
        project: ["./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tsEslint.plugin,
    },
    rules: {
      ...tsEslint.configs.strict[1].rules,
      ...tsEslint.configs.strict[2].rules,
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    ignores: [
      ".prettierrc.js",
      "eslint.config.js",
      "vite.config.ts",
      "dist/**",
      "build/**",
      "node_modules/**",
    ],
  },
];
