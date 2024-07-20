import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const DB_URL = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASS}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

export default defineConfig({
  dialect: "postgresql",
  schema: "./app/services/schema.server.ts",
  out: "./drizzle",
  dbCredentials: {
    url: DB_URL,
  },
});
