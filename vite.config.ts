import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import solid from "vite-plugin-solid";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), solid(), cloudflare()],
  resolve: {
    alias: {
      "@": Bun.fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
