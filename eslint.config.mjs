import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "next-env.d.ts",
    "public/original/**",
    "original_prototype/**",
    "playwright-report/**",
    "test-results/**",
  ]),
  {
    // R3F scene components mutate three.js objects inside useFrame callbacks by design.
    files: ["src/prototype/components/**/*.tsx"],
    rules: { "react-hooks/immutability": "off" },
  },
]);
