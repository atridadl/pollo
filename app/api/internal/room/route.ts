import { type NextRequest, NextResponse } from "next/server";

import { fetchCache, invalidateCache, setCache } from "@/_lib/redis";
import { db } from "@/_lib/db";
import { rooms } from "@/_lib/schema";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { publishToChannel } from "@/_lib/ably";
import { EventTypes } from "@/_utils/types";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = getAuth(request as NextRequest);

  const cachedResult = await fetchCache<
    {
      id: string;
      createdAt: Date;
      roomName: string;
    }[]
  >(`kv_roomlist_${userId}`);

  if (cachedResult) {
    return NextResponse.json(cachedResult, {
      status: 200,
      statusText: "SUCCESS",
    });
  } else {
    const roomList = await db.query.rooms.findMany({
      where: eq(rooms.userId, userId || ""),
    });

    await setCache(`kv_roomlist_${userId}`, roomList);

    return NextResponse.json(roomList, {
      status: 200,
      statusText: "SUCCESS",
    });
  }
}

export async function POST(request: Request) {
  const { userId } = getAuth(request as NextRequest);

  const reqBody = (await request.json()) as { name: string };

  const room = await db
    .insert(rooms)
    .values({
      id: `room_${createId()}`,
      created_at: Date.now().toString(),
      userId: userId || "",
      roomName: reqBody.name,
      storyName: "First Story!",
      scale: "0.5,1,2,3,5,8",
      visible: 0,
    })
    .returning();

  const success = room.length > 0;

  if (room) {
    await invalidateCache(`kv_roomlist_${userId}`);

    await publishToChannel(
      `${userId}`,
      EventTypes.ROOM_LIST_UPDATE,
      JSON.stringify(room)
    );
  }

  if (success) {
    return NextResponse.json(room, {
      status: 200,
      statusText: "SUCCESS",
    });
  }

  return NextResponse.json(
    { error: "Failed to create room!" },
    {
      status: 500,
      statusText: "ERROR",
    }
  );
}
