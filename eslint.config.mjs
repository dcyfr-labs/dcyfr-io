import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const localRules = await import("./eslint-local-rules/index.js");

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".vercel/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "test-results/**",
      "playwright-report/**",
      "eslint-local-rules/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    plugins: {
      "dcyfr-local": {
        rules: localRules.default,
      },
    },
    rules: {
      // Design token enforcement — matches dcyfr-labs/dcyfr-labs policy.
      // Primitive color guard (text-white, bg-black, etc.) added after the 2026-04-19
      // light-theme visibility regression showed the rule had a gap for theme-blind classes.
      "dcyfr-local/no-hardcoded-spacing": "off",
      "dcyfr-local/no-hardcoded-colors": "error",
      "dcyfr-local/no-hardcoded-typography": "off",
      "dcyfr-local/no-deprecated-design-tokens": "error",
      "dcyfr-local/no-legacy-dcyfr-palette": "error",
    },
  },
];

export default eslintConfig;
