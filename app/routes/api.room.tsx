import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { eventStream } from "remix-utils/sse/server";
import { db } from "~/services/db";
import { emitter } from "~/services/emitter.server";
import { rooms } from "~/services/schema";

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const { userId } = await getAuth({ context, params, request });

  const roomList = await db.query.rooms.findMany({
    where: eq(rooms.userId, userId || ""),
  });

  console.log(roomList);

  //   return NextResponse.json(roomList, {
  //     status: 200,
  //     statusText: "SUCCESS",
  //   });
  return eventStream(request.signal, function setup(send) {
    function handler(
      roomList: {
        userId: string;
        id: string;
        created_at: string | null;
        roomName: string | null;
        storyName: string | null;
        visible: number;
        scale: string;
      }[]
    ) {
      send({ event: "roomlist", data: JSON.stringify(roomList) });
    }

    send({ event: "roomlist", data: JSON.stringify(roomList) });

    emitter.on("roomlist", handler);

    return function clear() {
      emitter.off("roomlist", handler);
    };
  });
}
