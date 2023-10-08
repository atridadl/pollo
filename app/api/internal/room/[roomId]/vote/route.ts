import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/_lib/db";
import { votes } from "@/_lib/schema";
import { createId } from "@paralleldrive/cuid2";
import { publishToChannel } from "@/_lib/ably";
import { EventTypes } from "@/_utils/types";
import { getAuth } from "@clerk/nextjs/server";

export const runtime = "edge";

export async function PUT(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const { userId } = getAuth(request as NextRequest);

  if (!params.roomId) {
    return new NextResponse("RoomId Missing!", {
      status: 400,
      statusText: "BAD REQUEST!",
    });
  }

  const reqBody = (await request.json()) as { value: string };

  const upsertResult = await db
    .insert(votes)
    .values({
      id: `vote_${createId()}`,
      created_at: Date.now().toString(),
      value: reqBody.value,
      userId: userId || "",
      roomId: params.roomId,
    })
    .onConflictDoUpdate({
      target: [votes.userId, votes.roomId],
      set: {
        created_at: Date.now().toString(),
        value: reqBody.value,
        userId: userId || "",
        roomId: params.roomId,
      },
    });

  const success = upsertResult.rowsAffected > 0;

  if (success) {
    await publishToChannel(
      `${params.roomId}`,
      EventTypes.VOTE_UPDATE,
      reqBody.value
    );

    return NextResponse.json(upsertResult, {
      status: 200,
      statusText: "SUCCESS",
    });
  }

  return NextResponse.json(
    { error: "Failed to set vote!" },
    {
      status: 500,
      statusText: "ERROR",
    }
  );
}