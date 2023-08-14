import type { NextApiRequest, NextApiResponse } from "next";
import { validateApiKey } from "~/server/unkey";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let isValidKey: boolean = false;

  // Get the auth bearer token if it exists
  if (req.headers.authorization) {
    const key = req.headers.authorization.split("Bearer ").at(1);
    if (key) {
      isValidKey = await validateApiKey(key);
    }
  }

  // Error if the key is not valid
  if (!isValidKey) {
    res.status(403).json({ error: "UNAUTHORIZED" });
  }

  console.log(req.body);

  res.status(200).json({ result: "AUTHORIZED" });
}
