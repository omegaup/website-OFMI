/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import type { UserConfig } from "vitest/config";

const vitestConfig: UserConfig = {
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/__tests__/setupTests.ts"],
    threads: false,
    watch: false,
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["jotai/babel/plugin-react-refresh"],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    minify: false,
  },
  test: vitestConfig.test,
});
