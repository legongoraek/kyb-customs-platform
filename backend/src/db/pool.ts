import pg from "pg";
import { env } from "../config/env";

const { Pool } = pg;

const requiresSsl =
  env.nodeEnv === "production" ||
  env.databaseUrl.includes("supabase.co") ||
  env.databaseUrl.includes("pooler.supabase.com");

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: requiresSsl
    ? {
        rejectUnauthorized: false,
      }
    : false,
});