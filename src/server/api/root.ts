import { roomRouter } from "~/server/api/routers/room";
import { createTRPCRouter } from "~/server/api/trpc";
import { sessionRouter } from "./routers/session";
import { userRouter } from "./routers/user";
import { voteRouter } from "./routers/vote";
import { hookRouter } from "./routers/hook";

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
  hook: hookRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
