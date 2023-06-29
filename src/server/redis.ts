import { Redis } from "@upstash/redis";
import { env } from "~/env.mjs";
import https from "https";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
  agent: new https.Agent({ keepAlive: true }),
});
