import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema.server";
import "dotenv/config";

const DB_URL = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASS}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

const dbClient = postgres(DB_URL, {
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

migrate(drizzle(dbClient), { migrationsFolder: "./drizzle" });

export const db = drizzle(dbClient, { schema });
