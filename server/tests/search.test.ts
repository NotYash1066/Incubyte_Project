import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { cleanDatabase } from "./helpers/setup";
import { createTestUser } from "./helpers/auth";

let userToken: string;
let adminToken: string;

beforeAll(async () => {
  await cleanDatabase();
  const user = await createTestUser({ role: "user" });
  userToken = user.token;
  const admin = await createTestUser({
    email: "search-admin@test.com",
    name: "Search Admin",
    role: "admin",
  });
  adminToken = admin.token;
});

// Each search test needs clean data to avoid cross-contamination
beforeEach(async () => {
  await cleanDatabase();
});

async function createVehicle(overrides: Partial<{
  make: string;
  model: string;
  year: number;
  category: string;
  price: number;
  quantity: number;
}> = {}) {
  const res = await request(app)
    .post("/api/vehicles")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      make: "TestMake",
      model: "TestModel",
      year: 2024,
      category: "SEDAN",
      price: 25000,
      quantity: 10,
      ...overrides,
    });
  return res.body;
}

describe("GET /api/vehicles/search", () => {
  it("should return 401 without auth token", async () => {
    const res = await request(app).get("/api/vehicles/search");
    expect(res.status).toBe(401);
  });

  it("should return all vehicles when no filters provided", async () => {
    await createVehicle({ make: "Alpha", model: "One" });
    await createVehicle({ make: "Beta", model: "Two" });
    const res = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it("should filter by make (case-insensitive)", async () => {
    await createVehicle({ make: "Toyota", model: "Corolla" });
    await createVehicle({ make: "Honda", model: "Civic" });
    const res = await request(app)
      .get("/api/vehicles/search?make=toyota")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].make).toBe("Toyota");
  });

  it("should filter by model (partial match)", async () => {
    await createVehicle({ make: "Honda", model: "Civic EX" });
    await createVehicle({ make: "Honda", model: "Accord LX" });
    const res = await request(app)
      .get("/api/vehicles/search?model=civic")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].model).toBe("Civic EX");
  });

  it("should filter by category", async () => {
    await createVehicle({ make: "Ford", model: "Focus", category: "SEDAN" });
    await createVehicle({ make: "Ford", model: "Explorer", category: "SUV" });
    const res = await request(app)
      .get("/api/vehicles/search?category=SUV")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toBe("SUV");
  });

  it("should filter by minPrice", async () => {
    await createVehicle({ make: "Chevy", model: "Spark", price: 15000 });
    await createVehicle({ make: "Chevy", model: "Tahoe", price: 35000 });
    const res = await request(app)
      .get("/api/vehicles/search?minPrice=30000")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].price).toBe(35000);
  });

  it("should filter by maxPrice", async () => {
    await createVehicle({ make: "Nissan", model: "Versa", price: 15000 });
    await createVehicle({ make: "Nissan", model: "Maxima", price: 35000 });
    const res = await request(app)
      .get("/api/vehicles/search?maxPrice=25000")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].price).toBe(15000);
  });

  it("should filter by minPrice + maxPrice combined", async () => {
    await createVehicle({ make: "BMW", model: "3 Series", price: 22000 });
    await createVehicle({ make: "BMW", model: "5 Series", price: 35000 });
    await createVehicle({ make: "BMW", model: "7 Series", price: 55000 });
    const res = await request(app)
      .get("/api/vehicles/search?minPrice=20000&maxPrice=30000")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].price).toBe(22000);
  });

  it("should combine multiple filters", async () => {
    await createVehicle({ make: "Toyota", model: "Camry", category: "SEDAN" });
    await createVehicle({ make: "Toyota", model: "Highlander", category: "SUV" });
    await createVehicle({ make: "Honda", model: "Accord", category: "SEDAN" });
    const res = await request(app)
      .get("/api/vehicles/search?make=Toyota&category=SEDAN")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].make).toBe("Toyota");
    expect(res.body[0].category).toBe("SEDAN");
  });

  it("should return empty array when no match", async () => {
    const res = await request(app)
      .get("/api/vehicles/search?make=NonExistentMake")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
