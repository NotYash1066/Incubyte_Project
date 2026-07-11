import { execSync } from "child_process";
import { prisma } from "../../src/lib/prisma";

// Override env before anything else
process.env.DATABASE_URL ??= "file:./test.db";
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
