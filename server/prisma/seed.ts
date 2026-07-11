import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // Upsert admin user
  await prisma.user.upsert({
    where: { email: "admin@incubyte.com" },
    update: {},
    create: {
      email: "admin@incubyte.com",
      password,
      name: "Admin",
      role: "admin",
    },
  });

  // Upsert regular user
  await prisma.user.upsert({
    where: { email: "user@incubyte.com" },
    update: {},
    create: {
      email: "user@incubyte.com",
      password,
      name: "User",
      role: "user",
    },
  });

  // Seed vehicles only if none exist (idempotent)
  const existing = await prisma.vehicle.count();
  if (existing === 0) {
    await prisma.vehicle.createMany({
      data: [
        { make: "Toyota", model: "Camry", year: 2024, category: "SEDAN", price: 30000, quantity: 5 },
        { make: "Honda", model: "CR-V", year: 2024, category: "SUV", price: 35000, quantity: 3 },
        { make: "Ford", model: "F-150", year: 2024, category: "TRUCK", price: 45000, quantity: 2 },
        { make: "Chevrolet", model: "Corvette", year: 2024, category: "COUPE", price: 70000, quantity: 1 },
        { make: "Toyota", model: "Sienna", year: 2024, category: "VAN", price: 40000, quantity: 4 },
      ],
    });
  }

  console.log("Seed completed successfully");
  console.log("  Admin: admin@incubyte.com / password123");
  console.log("  User:  user@incubyte.com / password123");
  console.log("  5 vehicles seeded (or already exist)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
