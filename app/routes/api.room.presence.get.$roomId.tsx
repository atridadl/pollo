import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { and, eq } from "drizzle-orm";
import { eventStream } from "remix-utils/sse/server";
import { db } from "~/services/db.server";
import { emitter } from "~/services/emitter.server";
import { presence } from "~/services/schema";
import { createId } from "@paralleldrive/cuid2";

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const { userId, sessionClaims } = await getAuth({ context, params, request });

  const roomId = params.roomId;

  if (!roomId) {
    return json("RoomId Missing!", {
      status: 400,
      statusText: "BAD REQUEST!",
    });
  }

  if (!userId) {
    return json("Not Signed In!", {
      status: 403,
      statusText: "UNAUTHORIZED!",
    });
  }

  const name = sessionClaims.name as string;
  const image = sessionClaims.image as string;

  return eventStream(request.signal, function setup(send) {
    async function handler() {
      const presenceData = await db.query.presence.findMany({
        where: and(eq(presence.roomId, roomId || "")),
      });

      send({
        event: `${userId}-${params.roomId}`,
        data: JSON.stringify(presenceData),
      });
    }

    db.insert(presence)
      .values({
        id: `presence_${createId()}`,
        roomId: roomId || "",
        userFullName: name,
        userId: userId,
        userImageUrl: image,
        isAdmin: 0,
        isVIP: 0,
      })
      .onConflictDoUpdate({
        target: [presence.userId, presence.roomId],
        set: {
          roomId: roomId || "",
          userFullName: name,
          userId: userId,
          userImageUrl: image,
          isAdmin: 0,
          isVIP: 0,
        },
      })
      .then(async () => {
        emitter.emit("presence");
      });

    // Initial fetch
    emitter.on("presence", handler);

    return function clear() {
      db.delete(presence)
        .where(and(eq(presence.roomId, roomId), eq(presence.userId, userId)))
        .returning()
        .then(async () => {
          emitter.emit("presence");
        });
      emitter.off("presence", handler);
    };
  });
}
