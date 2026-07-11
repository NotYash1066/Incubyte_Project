import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { cleanDatabase } from "./helpers/setup";

describe("POST /api/auth/register", () => {
  beforeAll(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  it("should register a new user and return a token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", "test@example.com");
    expect(res.body.user).toHaveProperty("name", "Test User");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("should return 409 if email already exists", async () => {
    // Register first user
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "duplicate@example.com",
        password: "password123",
        name: "First User",
      });

    // Try registering with same email
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "duplicate@example.com",
        password: "password456",
        name: "Second User",
      });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 if password is too short", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "short@example.com",
        password: "12",
        name: "Short Password",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("POST /api/auth/login", () => {
  beforeAll(async () => {
    await cleanDatabase();
    // Register a user to login with
    await request(app).post("/api/auth/register").send({
      email: "login@example.com",
      password: "password123",
      name: "Login User",
    });
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  it("should login with valid credentials and return a token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", "login@example.com");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("should return 401 with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 for non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "password123",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
