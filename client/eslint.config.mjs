import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // MongoDB VS Code playground scratch files. These are editor scratchpads
    // that use a global `use()` helper, so the React hooks rule flags them
    // as top-level hook calls even though they are not part of the app.
    "**/*.mongodb.js",
  ]),
]);

export default eslintConfig;
