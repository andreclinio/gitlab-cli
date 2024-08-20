import eslintPluginPrettier from "eslint-plugin-prettier";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    ignores: ["node_modules/", "dist/", "build/"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
      prettier: eslintPluginPrettier,
    },
    rules: {    
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "class", next: "function" },
        { blankLine: "always", prev: "function", next: "function" }
      ],
      "max-len": ["warn", { code: 120 }],
      curly: ["error", "multi"],
      "prettier/prettier": "error",
      "no-console": "warn",
      "no-var": "error",
      "no-unneeded-ternary" : "error",
      "no-debugger": "error",
      "no-nested-ternary": "error",
      "consistent-return": "error",
      "no-useless-assignment": "error",
      "no-unmodified-loop-condition": "error",
      "no-template-curly-in-string": "error",
      "no-constructor-return": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "prettier/prettier": [
        "error",
        {
          singleQuote: true,
          trailingComma: "none",
          tabWidth: 4,
          useTabs: false,
        },
      ],
    },
  },
];
