import { Unkey } from "@unkey/api";
import { env } from "~/env.mjs";

export const unkey = new Unkey({ token: env.UNKEY_ROOT_KEY });

export const validateApiKey = async (key: string) => {
  try {
    const res = await unkey.keys.verify({
      key,
    });
    return res.valid;
  } catch {
    return false;
  }
};
