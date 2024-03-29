import { resolve } from "path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      name: "jiraStandupOrder",
      entry: resolve(__dirname, "src/main.ts"),
      fileName: "jiraStandupOrder",
    },
  },
});
