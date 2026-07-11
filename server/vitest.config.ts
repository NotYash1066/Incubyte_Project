import dotenv from "dotenv";
import { defineConfig } from "vitest/config";
import path from "path";

// Load DATABASE_URL from root .env (shared across workspaces)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/test",
      JWT_SECRET: "test-secret",
      JWT_EXPIRES_IN: "24h",
    },
    setupFiles: ["./tests/helpers/setup.ts"],
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
