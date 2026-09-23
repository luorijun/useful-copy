import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "oxc"],
  categories: { correctness: "error" },
  rules: { "typescript/no-explicit-any": "error" },
  ignorePatterns: [
    "dist/**",
    "node_modules/**",
    ".wrangler/**",
    "cloudflare-env.d.ts",
  ],
});
