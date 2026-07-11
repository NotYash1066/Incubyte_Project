import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/appError.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

function generateToken(userId: number, role: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError(500, "JWT_SECRET is not defined");

  return jwt.sign({ userId: String(userId), role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
}

// POST /api/auth/register
router.post("/register", asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors[0].message);
  }

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, "Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  });

  const token = generateToken(user.id, user.role);

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}));

// POST /api/auth/login
router.post("/login", asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors[0].message);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(400, "Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = generateToken(user.id, user.role);

  res.status(200).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}));

export default router;
