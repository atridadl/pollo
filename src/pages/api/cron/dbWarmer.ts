import { prisma } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Cron Request: ", req);
  // the most useless call... nothing exists here
  await prisma.verificationToken.findMany();

  res.status(200);
}
