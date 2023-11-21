import { NextResponse, type NextRequest } from "next/server";

import { publishToChannel, publishToMultipleChannels } from "@/_lib/ably";
import { db } from "@/_lib/db";
import { invalidateCache } from "@/_lib/redis";
import { logs, rooms, votes } from "@/_lib/schema";
import { EventTypes } from "@/_utils/types";
import { getAuth } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { env } from "env.mjs";

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  if (!params.roomId) {
    return new NextResponse("RoomId Missing!", {
      status: 400,
      statusText: "BAD REQUEST!",
    });
  }

  const roomFromDb = await db.query.rooms.findFirst({
    where: eq(rooms.id, params.roomId),
    with: {
      logs: true,
    },
  });

  if (roomFromDb) {
    return NextResponse.json(roomFromDb, {
      status: 200,
      statusText: "SUCCESS",
    });
  } else {
    return new NextResponse("ROOM NOT FOUND", {
      status: 404,
      statusText: "ROOM NOT FOUND",
    });
  }
}

export async function DELETE(
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

  const deletedRoom = await db
    .delete(rooms)
    .where(eq(rooms.id, params.roomId))
    .returning();

  const success = deletedRoom.length > 0;

  if (success) {
    if (env.APP_ENV === "production")
      await invalidateCache(`kv_roomlist_${userId}`);

    await publishToMultipleChannels(
      [`${userId}`, `${params.roomId}`],
      [EventTypes.ROOM_LIST_UPDATE, EventTypes.ROOM_UPDATE],
      JSON.stringify(deletedRoom)
    );

    return NextResponse.json(deletedRoom, {
      status: 200,
      statusText: "SUCCESS",
    });
  }

  return NextResponse.json(
    { error: "Error deleting room!" },
    {
      status: 500,
      statusText: "ERROR",
    }
  );
}

export async function PUT(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const { userId } = getAuth(request as NextRequest);

  const reqBody = (await request.json()) as {
    name: string;
    visible: number;
    scale: string;
    reset: boolean;
    log: boolean;
  };

  if (!params.roomId) {
    return new NextResponse("RoomId Missing!", {
      status: 400,
      statusText: "BAD REQUEST!",
    });
  }

  if (reqBody.log) {
    const oldRoom = await db.query.rooms.findFirst({
      where: eq(rooms.id, params.roomId),
      with: {
        votes: true,
        logs: true,
      },
    });

    oldRoom &&
      (await db.insert(logs).values({
        id: `log_${createId()}`,
        created_at: Date.now().toString(),
        userId: userId || "",
        roomId: params.roomId,
        scale: oldRoom.scale,
        votes: JSON.stringify(
          oldRoom.votes.map((vote) => {
            return {
              name: vote.userId,
              value: vote.value,
            };
          })
        ),
        roomName: oldRoom.roomName,
        storyName: oldRoom.storyName,
      }));
  }

  if (reqBody.reset) {
    await db.delete(votes).where(eq(votes.roomId, params.roomId));
  }

  const newRoom = reqBody.reset
    ? await db
        .update(rooms)
        .set({
          storyName: reqBody.name,
          visible: reqBody.visible,
          scale: [...new Set(reqBody.scale.split(","))]
            .filter((item) => item !== "")
            .toString(),
        })
        .where(eq(rooms.id, params.roomId))
        .returning()
    : await db
        .update(rooms)
        .set({
          visible: reqBody.visible,
        })
        .where(eq(rooms.id, params.roomId))
        .returning();

  const success = newRoom.length > 0;

  if (success) {
    await publishToChannel(
      `${params.roomId}`,
      EventTypes.ROOM_UPDATE,
      JSON.stringify(newRoom)
    );
  }

  if (success) {
    return NextResponse.json(newRoom, {
      status: 200,
      statusText: "SUCCESS",
    });
  }

  return NextResponse.json(
    { error: "Room update failed" },
    {
      status: 500,
      statusText: "ERROR",
    }
  );
}
