import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      server: path.resolve(__dirname),
    },
  },
});
