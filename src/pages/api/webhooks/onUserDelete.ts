import { eq } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import { logs, rooms, votes } from "~/server/schema";
import { validateRequest } from "~/server/unkey";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const success = await validateRequest(req, res);

  if (success) {
    const requestBody = req.body as {
      data: {
        deleted: string;
        id: string;
        object: string;
      };
      object: string;
      type: string;
    };

    const deletedRoom = await db
      .delete(rooms)
      .where(eq(rooms.userId, requestBody.data.id));

    if (deletedRoom.rowsAffected > 0) {
      await db.delete(logs).where(eq(logs.userId, requestBody.data.id));
      await db.delete(votes).where(eq(votes.userId, requestBody.data.id));
    }

    res.status(200).json({ result: "USER DELETED" });
  }
}
