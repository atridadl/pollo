import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Made it to the function!");
  res.status(200).json({ result: "Pong!" });
}
