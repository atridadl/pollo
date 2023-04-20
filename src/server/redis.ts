import { Redis } from "ioredis";
import { env } from "~/env.mjs";

export const redis = new Redis(env.REDIS_URL);

export const writeToCache = async (
  key: string,
  value: string | number | Buffer,
  timeout?: number
): Promise<boolean> => {
  try {
    if (!!timeout) {
      await redis.set(`${env.APP_ENV}_${key}`, value, "EX", timeout);
    } else {
      await redis.set(`${env.APP_ENV}_${key}`, value);
    }
    return true;
  } catch {
    return false;
  }
};

export const fetchFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    // This is bad please don't ever do this.
    const cachedValue: Awaited<T> | null = JSON.parse(
      (await redis.get(`${env.APP_ENV}_${key}`)) || ""
    ) as Awaited<T> | null;
    if (!cachedValue && cachedValue !== 0) {
      throw new Error("Cache Miss");
    }
    console.log(`CACHE HIT FOR KEY ${key}: `, cachedValue);
    return cachedValue;
  } catch {
    console.log(`CACHE MISS FOR KEY ${key}!`);
    return null;
  }
};

export const deleteFromCache = async (key: string) => {
  try {
    await redis.del(`${env.APP_ENV}_${key}`);
    return true;
  } catch {
    return false;
  }
};
