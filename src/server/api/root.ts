import { roomRouter } from "~/server/api/routers/room";
import { createTRPCRouter } from "~/server/api/trpc";
import { voteRouter } from "./routers/vote";
import { restRouter } from "./routers/rest";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  room: roomRouter,
  vote: voteRouter,
  rest: restRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
