import { env } from "./env.js";
import { Pool } from "pg";

if (!env.DATABASE_URL) {
  throw new Error("Falta configurar DATABASE_URL");
}

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
});