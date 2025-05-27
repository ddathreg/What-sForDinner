import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },

    rules: {
      "react/prop-types": 0,
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "prettier/prettier": 0,
    },
    languageOptions: {
      globals: {
        adm: true,
        process: true,
        console: true,
        require: true
      }
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
