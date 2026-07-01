"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
const pool_1 = require("../../db/pool");
exports.healthRoutes = (0, express_1.Router)();
exports.healthRoutes.get("/", async (_req, res) => {
    try {
        await pool_1.pool.query("SELECT 1");
        res.json({
            ok: true,
            service: "kyb-customs-backend",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            ok: false,
            service: "kyb-customs-backend",
            database: "disconnected",
            timestamp: new Date().toISOString(),
        });
    }
});
