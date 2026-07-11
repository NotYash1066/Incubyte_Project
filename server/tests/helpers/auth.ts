import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../src/lib/prisma";

export async function createTestUser(overrides: {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
} = {}) {
  const email = overrides.email ?? `user-${Date.now()}@test.com`;
  const password = overrides.password ?? "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: overrides.name ?? "Test User",
      role: overrides.role ?? "user",
    },
  });

  const secret = process.env.JWT_SECRET ?? "test-secret";
  const token = jwt.sign(
    { userId: String(user.id), role: user.role },
    secret,
    { expiresIn: "24h" }
  );

  return { user, token };
}
