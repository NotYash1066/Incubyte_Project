import { execSync } from "child_process";
import { prisma } from "../../src/lib/prisma";

// Ensure env vars are set for tests (values come from vitest.config.ts env block)
process.env.DATABASE_URL ??= "postgresql://placeholder:placeholder@localhost:5432/test";
process.env.JWT_SECRET ??= "test-secret";

// Run migrations on test database before all tests
execSync("npx prisma migrate deploy", {
  env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  cwd: process.cwd(),
});

export async function cleanDatabase() {
  await prisma.user.deleteMany();
  await prisma.vehicle.deleteMany();
}
