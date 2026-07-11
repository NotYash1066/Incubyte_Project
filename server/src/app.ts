import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import vehicleRoutes from "./routes/vehicles.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default app;
