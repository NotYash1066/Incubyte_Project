import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { adminMiddleware } from "../middleware/admin.js";

const router = Router();

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1900).max(2100),
  category: z.enum(["SEDAN", "SUV", "TRUCK", "COUPE", "VAN"]),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().min(0).default(0),
});

const vehicleUpdateSchema = z.object({
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  category: z.enum(["SEDAN", "SUV", "TRUCK", "COUPE", "VAN"]).optional(),
  price: z.number().positive().optional(),
  quantity: z.number().int().min(0).optional(),
});

// All vehicle routes require authentication
router.use(authMiddleware);

// GET /api/vehicles — list all
router.get("/", async (_req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(vehicles);
  } catch (error) {
    console.error("List vehicles error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/vehicles/:id — get by id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid vehicle ID" });
      return;
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }

    res.json(vehicle);
  } catch (error) {
    console.error("Get vehicle error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/vehicles — create (admin only)
router.post("/", adminMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = vehicleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const vehicle = await prisma.vehicle.create({ data: parsed.data });
    res.status(201).json(vehicle);
  } catch (error) {
    console.error("Create vehicle error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/vehicles/:id — update (admin only)
router.put("/:id", adminMiddleware, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid vehicle ID" });
      return;
    }

    const parsed = vehicleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: parsed.data,
    });
    res.json(vehicle);
  } catch (error) {
    console.error("Update vehicle error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/vehicles/:id — delete (admin only)
router.delete("/:id", adminMiddleware, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid vehicle ID" });
      return;
    }

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }

    await prisma.vehicle.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Delete vehicle error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
