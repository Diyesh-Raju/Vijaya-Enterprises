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
    // The Codrops "Gooey Hover" demo, vendored close to as it ships. Its own
    // style is not this project's, and it is kept that way on purpose so it
    // can still be diffed against the upstream template — so it is not
    // linted.
    "lib/gooey/**",
  ]),
]);

export default eslintConfig;
