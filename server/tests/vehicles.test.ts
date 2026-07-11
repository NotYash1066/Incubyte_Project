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
    email: "admin@test.com",
    name: "Admin",
    role: "admin",
  });
  adminToken = admin.token;
});

afterAll(async () => {
  await cleanDatabase();
});

describe("GET /api/vehicles", () => {
  it("should return 401 without auth token", async () => {
    const res = await request(app).get("/api/vehicles");
    expect(res.status).toBe(401);
  });

  it("should return empty array when no vehicles exist", async () => {
    const res = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("GET /api/vehicles/:id", () => {
  it("should return 401 without auth token", async () => {
    const res = await request(app).get("/api/vehicles/1");
    expect(res.status).toBe(401);
  });

  it("should return 404 for non-existent vehicle", async () => {
    const res = await request(app)
      .get("/api/vehicles/999")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/vehicles", () => {
  it("should return 401 without auth token", async () => {
    const res = await request(app).post("/api/vehicles").send({
      make: "Toyota",
      model: "Camry",
      year: 2024,
      category: "SEDAN",
      price: 30000,
      quantity: 5,
    });
    expect(res.status).toBe(401);
  });

  it("should return 403 for non-admin user", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        make: "Toyota",
        model: "Camry",
        year: 2024,
        category: "SEDAN",
        price: 30000,
        quantity: 5,
      });
    expect(res.status).toBe(403);
  });

  it("should create a vehicle when admin", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "Toyota",
        model: "Camry",
        year: 2024,
        category: "SEDAN",
        price: 30000,
        quantity: 5,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.make).toBe("Toyota");
    expect(res.body.model).toBe("Camry");
  });

  it("should return 400 with invalid data", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ make: "Toyota" });
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/vehicles/:id", () => {
  let vehicleId: number;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "Honda",
        model: "Civic",
        year: 2024,
        category: "SEDAN",
        price: 25000,
        quantity: 3,
      });
    vehicleId = res.body.id;
  });

  it("should return 401 without auth token", async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .send({ price: 26000 });
    expect(res.status).toBe(401);
  });

  it("should return 403 for non-admin user", async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ price: 26000 });
    expect(res.status).toBe(403);
  });

  it("should update vehicle when admin", async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 26000, quantity: 10 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(26000);
    expect(res.body.quantity).toBe(10);
  });

  it("should return 404 for non-existent vehicle", async () => {
    const res = await request(app)
      .put("/api/vehicles/999")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 26000 });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/vehicles/:id", () => {
  let vehicleId: number;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "Ford",
        model: "Focus",
        year: 2023,
        category: "SEDAN",
        price: 22000,
        quantity: 2,
      });
    vehicleId = res.body.id;
  });

  it("should return 401 without auth token", async () => {
    const res = await request(app).delete(`/api/vehicles/${vehicleId}`);
    expect(res.status).toBe(401);
  });

  it("should return 403 for non-admin user", async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("should delete vehicle when admin", async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);

    // Verify it's gone
    const getRes = await request(app)
      .get(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(getRes.status).toBe(404);
  });

  it("should return 404 for non-existent vehicle", async () => {
    const res = await request(app)
      .delete("/api/vehicles/999")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
