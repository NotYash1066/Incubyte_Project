import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import vehicleRoutes from "./routes/vehicles.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://incubyte-dealership.vercel.app", "https://incubyte-dealership-api.onrender.com"]
    : true,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
