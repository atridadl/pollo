import { getAuth } from "@clerk/remix/ssr.server";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { db } from "~/services/db.server";
import { emitter } from "~/services/emitter.server";
import { rooms } from "~/services/schema";

export async function action({ request, params, context }: ActionFunctionArgs) {
  const { userId } = await getAuth({ context, params, request });

  const roomId = params.roomId;

  if (!roomId) {
    return json("RoomId Missing!", {
      status: 400,
      statusText: "BAD REQUEST!",
    });
  }

  const deletedRoom = await db
    .delete(rooms)
    .where(eq(rooms.id, roomId))
    .returning();

  const success = deletedRoom.length > 0;

  if (success) {
    emitter.emit("roomlist");

    return json(deletedRoom, {
      status: 200,
      statusText: "SUCCESS",
    });
  }
}
