import Ably from "ably/promises";
import { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    // Signed in
    const client = new Ably.Realtime(env.ABLY_PRIVATE_KEY);

    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: session.user.id,
    });
    res.status(200).json(tokenRequestData);
  } else {
    // Not Signed in
    res.status(401);
  }
}
