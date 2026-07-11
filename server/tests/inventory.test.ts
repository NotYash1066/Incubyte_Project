import { describe, it, expect, beforeAll, afterAll } from "vitest";
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
    email: "inv-admin@test.com",
    name: "Inventory Admin",
    role: "admin",
  });
  adminToken = admin.token;
});

// afterAll intentionally omitted — cleanDatabase in beforeAll of each file is sufficient

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

describe("POST /api/vehicles/:id/purchase", () => {
  it("should return 401 without auth token", async () => {
    const res = await request(app).post("/api/vehicles/1/purchase");
    expect(res.status).toBe(401);
  });

  it("should return 404 for non-existent vehicle", async () => {
    const res = await request(app)
      .post("/api/vehicles/999/purchase")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it("should purchase one unit and decrement quantity", async () => {
    const vehicle = await createVehicle({ quantity: 5 });
    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(4);
  });

  it("should purchase specified quantity", async () => {
    const vehicle = await createVehicle({ quantity: 10 });
    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 3 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(7);
  });

  it("should return 400 if quantity exceeds available stock", async () => {
    const vehicle = await createVehicle({ quantity: 2 });
    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 5 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 if vehicle is out of stock", async () => {
    const vehicle = await createVehicle({ quantity: 1 });
    // Purchase the only unit
    await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);
    // Try to purchase again
    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("POST /api/vehicles/:id/restock", () => {
  it("should return 401 without auth token", async () => {
    const res = await request(app).post("/api/vehicles/1/restock");
    expect(res.status).toBe(401);
  });

  it("should return 403 for non-admin user", async () => {
    const vehicle = await createVehicle();
    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 5 });
    expect(res.status).toBe(403);
  });

  it("should return 404 for non-existent vehicle", async () => {
    const res = await request(app)
      .post("/api/vehicles/999/restock")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 5 });
    expect(res.status).toBe(404);
  });

  it("should restock and increment quantity", async () => {
    const vehicle = await createVehicle({ quantity: 3 });
    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 10 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(13);
  });

  it("should default to restock 1 if quantity not specified", async () => {
    const vehicle = await createVehicle({ quantity: 0 });
    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(1);
  });

  it("should return 400 with invalid quantity", async () => {
    const vehicle = await createVehicle({ quantity: 5 });
    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 0 });
    expect(res.status).toBe(400);
  });
});
