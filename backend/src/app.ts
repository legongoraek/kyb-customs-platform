import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { healthRoutes } from "./modules/health/health.routes";
import { kybRoutes } from "./modules/kyb/kyb.routes";

export const app = express();

const allowedOrigins = [
  env.frontendUrl,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "KYB Customs API",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/kyb-cases", kybRoutes);

app.use((_req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada",
  });
});