import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://neondb_owner:npg_Ik3KnRls0NMJ@ep-misty-dust-aohjec7o.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
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
