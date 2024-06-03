import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  dialect: "postgresql", // "postgresql" | "mysql"
  schema: "./app/services/schema.server.ts",
  out: "./drizzle/generated",
  dbCredentials: {
    url: `${process.env.DATABASE_URL}`
  }
})