"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = __importDefault(require("pg"));
const env_1 = require("../config/env");
const { Pool } = pg_1.default;
const requiresSsl = env_1.env.nodeEnv === "production" ||
    env_1.env.databaseUrl.includes("supabase.co") ||
    env_1.env.databaseUrl.includes("pooler.supabase.com");
exports.pool = new Pool({
    connectionString: env_1.env.databaseUrl,
    ssl: requiresSsl
        ? {
            rejectUnauthorized: false,
        }
        : false,
});
