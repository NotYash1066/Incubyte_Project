import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("App", () => {
  it("GET /api/health returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("GET /unknown-route returns 404", async () => {
    const res = await request(app).get("/unknown-route");
    expect(res.status).toBe(404);
  });
});
