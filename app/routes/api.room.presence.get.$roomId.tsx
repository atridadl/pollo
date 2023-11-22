import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { and, eq } from "drizzle-orm";
import { eventStream } from "remix-utils/sse/server";
import { db } from "~/services/db.server";
import { emitter } from "~/services/emitter.server";
import { presence, rooms } from "~/services/schema";

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const { userId } = await getAuth({ context, params, request });

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

  return eventStream(request.signal, function setup(send) {
    async function handler() {
      const presenceData = await db.query.presence.findMany({
        where: and(
          eq(presence.userId, userId || ""),
          eq(presence.roomId, roomId || "")
        ),
      });

      send({
        event: `${userId}-${params.roomId}`,
        data: JSON.stringify(presenceData),
      });
    }

    // Initial fetch
    db.query.presence
      .findMany({
        where: and(
          eq(presence.userId, userId || ""),
          eq(presence.roomId, roomId || "")
        ),
      })
      .then((presenceData) => {
        return send({
          event: `${userId}-${params.roomId}`,
          data: JSON.stringify(presenceData),
        });
      });

    emitter.on("presence", handler);

    return function clear() {
      emitter.off("presence", handler);
    };
  });
}
