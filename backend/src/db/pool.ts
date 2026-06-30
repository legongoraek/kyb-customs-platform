import pg from "pg";
import { env } from "../config/env";

const { Pool } = pg;

const isSupabaseConnection = env.databaseUrl.includes("supabase.co");

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: isSupabaseConnection
    ? {
        rejectUnauthorized: false,
      }
    : env.nodeEnv === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});