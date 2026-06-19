import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react({})],
  test: {
    environment: "jsdom",
    setupFiles: ["./__tests__/setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      client: path.resolve(__dirname, "./"),
    },
  },
});
