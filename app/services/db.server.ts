import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.server";
import "dotenv/config";

const DB_URL =
  process.env.DB_URL ||
  `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:5432/${process.env.DB_NAME}`;

const dbClient = postgres(DB_URL, {
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export const db = drizzle(dbClient, { schema });
