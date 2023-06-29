import { Redis } from "@upstash/redis";
import https from "https";

export const redis = Redis.fromEnv({
  agent: new https.Agent({ keepAlive: true }),
});
