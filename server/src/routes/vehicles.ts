import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
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

const searchSchema = z.object({
  make: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  category: z.enum(["SEDAN", "SUV", "TRUCK", "COUPE", "VAN"]).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
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

// GET /api/vehicles/search — search with filters
router.get("/search", asyncHandler(async (req: Request, res: Response) => {
  const parsed = searchSchema.safeParse(req.query);
  if (!parsed.success) throw new AppError(400, parsed.error.errors[0].message);

  const where: Prisma.VehicleWhereInput = {};

  if (parsed.data.make) {
    where.make = { contains: parsed.data.make, mode: "insensitive" };
  }

  if (parsed.data.model) {
    where.model = { contains: parsed.data.model, mode: "insensitive" };
  }

  if (parsed.data.category) {
    where.category = parsed.data.category;
  }

  if (parsed.data.minPrice || parsed.data.maxPrice) {
    where.price = {};
    if (parsed.data.minPrice) where.price.gte = parsed.data.minPrice;
    if (parsed.data.maxPrice) where.price.lte = parsed.data.maxPrice;
  }

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  res.json(vehicles);
}));

// GET /api/vehicles/:id — get by id
router.get("/:id", asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id as string);
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
  const id = parseId(req.params.id as string);

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
  const id = parseId(req.params.id as string);
  await findVehicleOrThrow(id);
  await prisma.vehicle.delete({ where: { id } });
  res.status(204).send();
}));

// POST /api/vehicles/:id/purchase — purchase (any auth user, atomic)
router.post("/:id/purchase", asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id as string);

  const parsed = purchaseSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.errors[0].message);

  const purchaseQty = parsed.data.quantity;

  const updated = await prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new AppError(404, "Vehicle not found");

    const result = await tx.vehicle.updateMany({
      where: { id, quantity: { gte: purchaseQty } },
      data: { quantity: { decrement: purchaseQty } },
    });

    if (result.count === 0) {
      throw new AppError(
        400,
        `Insufficient stock. Available: ${vehicle.quantity}, requested: ${purchaseQty}`,
      );
    }

    return tx.vehicle.findUnique({ where: { id } });
  });

  res.json(updated);

}));

// POST /api/vehicles/:id/restock — restock (admin only)
router.post("/:id/restock", adminMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id as string);

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
