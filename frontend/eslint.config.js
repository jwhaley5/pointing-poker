import js from "@eslint/js"
import tseslint from "typescript-eslint"

export default [
  { ignores: ["dist", "src/routeTree.gen.ts", "src/sst-env.d.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Only the most essential rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "off",
    },
  },
]
