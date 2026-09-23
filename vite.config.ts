import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), react(), cloudflare()],
  resolve: {
    alias: {
      "@": Bun.fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
