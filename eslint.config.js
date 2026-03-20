import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "api/**",
      "drizzle/migrations/**",
      "server/_core/**",
      "client/src/_core/**",
      "attached_assets/**",
      "*.config.js",
      "*.config.ts",
      "client/public/**",
      // Stray files not in tsconfig scope
      "pages/**",
      "hooks/**",
      "contexts/**",
      "lib/**",
    ],
  },

  // Base TypeScript config for all files
  ...tseslint.configs.recommended,

  // Type-checked rules for source files (in tsconfig scope)
  {
    files: ["client/src/**/*.{ts,tsx}", "server/**/*.ts", "shared/**/*.ts"],
    ignores: ["**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Error: catch unused variables (allow underscore-prefixed)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Warn: discourage explicit any
      "@typescript-eslint/no-explicit-any": "warn",

      // Error: must await promises (no floating promises)
      "@typescript-eslint/no-floating-promises": "error",

      // Error: consistent return in server code
      "consistent-return": "error",

      // Allow require() imports in some cases
      "@typescript-eslint/no-require-imports": "off",

      // Allow declaration merging (used in type definition files)
      "@typescript-eslint/no-unsafe-declaration-merging": "off",
    },
  },

  // React component files: relax rules that conflict with React patterns
  {
    files: ["client/src/**/*.tsx"],
    rules: {
      // useEffect cleanup patterns have inconsistent returns
      "consistent-return": "off",
      // tRPC queryClient.invalidate() in event handlers is safe fire-and-forget
      "@typescript-eslint/no-floating-promises": "warn",
    },
  },

  // Test files: no type-checking required, relaxed rules
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Prettier must be last to override formatting rules
  eslintConfigPrettier
);
