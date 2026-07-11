import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { adminMiddleware } from "../middleware/admin.js";
import { AppError } from "../lib/appError.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1900).max(2100),
  category: z.enum(["SEDAN", "SUV", "TRUCK", "COUPE", "VAN"]),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().min(0).default(0),
});

const purchaseSchema = z.object({
  quantity: z.number().int().positive().default(1),
});

const restockSchema = z.object({
  quantity: z.number().int().positive("Restock quantity must be positive").default(1),
});

const vehicleUpdateSchema = z.object({
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  category: z.enum(["SEDAN", "SUV", "TRUCK", "COUPE", "VAN"]).optional(),
  price: z.number().positive().optional(),
  quantity: z.number().int().min(0).optional(),
});

function parseId(idStr: string): number {
  const id = Number(idStr);
  if (Number.isNaN(id)) throw new AppError(400, "Invalid vehicle ID");
  return id;
}

async function findVehicleOrThrow(id: number) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new AppError(404, "Vehicle not found");
  return vehicle;
}

// All vehicle routes require authentication
router.use(authMiddleware);

// GET /api/vehicles — list all
router.get("/", asyncHandler(async (_req: Request, res: Response) => {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(vehicles);
}));

// GET /api/vehicles/:id — get by id
router.get("/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const vehicle = await findVehicleOrThrow(id);
  res.json(vehicle);
}));

// POST /api/vehicles — create (admin only)
router.post("/", adminMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.errors[0].message);

  const vehicle = await prisma.vehicle.create({ data: parsed.data });
  res.status(201).json(vehicle);
}));

// PUT /api/vehicles/:id — update (admin only)
router.put("/:id", adminMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  const parsed = vehicleUpdateSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.errors[0].message);

  await findVehicleOrThrow(id);

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: parsed.data,
  });
  res.json(vehicle);
}));

// DELETE /api/vehicles/:id — delete (admin only)
router.delete("/:id", adminMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  await findVehicleOrThrow(id);
  await prisma.vehicle.delete({ where: { id } });
  res.status(204).send();
}));

// POST /api/vehicles/:id/purchase — purchase (any auth user)
router.post("/:id/purchase", asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  const parsed = purchaseSchema.safeParse(req.body);
  const purchaseQty = parsed.success ? parsed.data.quantity : 1;

  const vehicle = await findVehicleOrThrow(id);

  if (vehicle.quantity < purchaseQty) {
    throw new AppError(
      400,
      `Insufficient stock. Available: ${vehicle.quantity}, requested: ${purchaseQty}`,
    );
  }

  const updated = await prisma.vehicle.update({
    where: { id },
    data: { quantity: { decrement: purchaseQty } },
  });
  res.json(updated);
}));

// POST /api/vehicles/:id/restock — restock (admin only)
router.post("/:id/restock", adminMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  const parsed = restockSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.errors[0].message);

  await findVehicleOrThrow(id);

  const updated = await prisma.vehicle.update({
    where: { id },
    data: { quantity: { increment: parsed.data.quantity } },
  });
  res.json(updated);
}));

export default router;
