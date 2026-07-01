"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const health_routes_1 = require("./modules/health/health.routes");
const kyb_routes_1 = require("./modules/kyb/kyb.routes");
exports.app = (0, express_1.default)();
const allowedOrigins = [
    env_1.env.frontendUrl,
    "http://localhost:5173",
    "http://localhost:5174",
].filter(Boolean);
exports.app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
exports.app.use(express_1.default.json({ limit: "10mb" }));
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.get("/", (_req, res) => {
    res.json({
        ok: true,
        message: "KYB Customs API",
    });
});
exports.app.use("/api/health", health_routes_1.healthRoutes);
exports.app.use("/api/kyb-cases", kyb_routes_1.kybRoutes);
exports.app.use((_req, res) => {
    res.status(404).json({
        ok: false,
        message: "Ruta no encontrada",
    });
});
