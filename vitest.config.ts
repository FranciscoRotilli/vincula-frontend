import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setupTests.ts"],
    globals: true,
    include: ["test/**/*.test.{ts,tsx}"],
    css: true, // permite importar .css/.module.css sem erro
    alias: {
      // ajuste se você usa paths do tsconfig
      // "@/*": new URL("./src/", import.meta.url).pathname,
    },
    // se usar Next <15 com ESM, pode precisar:
    // deps: { fallbackCJS: true }
  },
});
