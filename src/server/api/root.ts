import { createTRPCRouter } from "~/server/api/trpc";
import { roomRouter } from "~/server/api/routers/room";
import { voteRouter } from "./routers/vote";
import { userRouter } from "./routers/user";
import { sessionRouter } from "./routers/session";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  room: roomRouter,
  vote: voteRouter,
  user: userRouter,
  session: sessionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;