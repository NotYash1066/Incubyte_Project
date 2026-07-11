import { execSync } from "child_process";
import { prisma } from "../../src/lib/prisma";

// Override env before anything else
process.env.DATABASE_URL ??= "postgresql://neondb_owner:npg_Ik3KnRls0NMJ@ep-misty-dust-aohjec7o.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
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
