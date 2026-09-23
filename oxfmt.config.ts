import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  endOfLine: "lf",
  insertFinalNewline: true,
  sortPackageJson: false,
  ignorePatterns: [
    "dist/**",
    "node_modules/**",
    ".wrangler/**",
    "cloudflare-env.d.ts",
    "bun.lock",
    "drizzle/meta/**",
  ],
});
