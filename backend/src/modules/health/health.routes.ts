import { Router } from "express";
import { pool } from "../../db/pool";

export const healthRoutes = Router();

healthRoutes.get("/", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      ok: true,
      service: "kyb-customs-backend",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      service: "kyb-customs-backend",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});