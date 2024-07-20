import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const DB_URL =
  process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:5432/${process.env.DB_NAME}`;

export default defineConfig({
  dialect: "postgresql",
  schema: "./app/services/schema.server.ts",
  out: "./drizzle",
  dbCredentials: {
    url: DB_URL,
  },
});
