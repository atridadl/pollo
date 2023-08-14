import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchCache, setCache } from "~/server/redis";
import { sql } from "drizzle-orm";
import { rooms, votes } from "~/server/schema";

export const restRouter = createTRPCRouter({
  voteCount: publicProcedure
    .meta({ openapi: { method: "GET", path: "/rest/votes/count" } })
    .input(z.void())
    .output(z.number())
    .query(async ({ ctx }) => {
      const cachedResult = await fetchCache<number>(`kv_votecount`);

      if (cachedResult) {
        return cachedResult;
      } else {
        const votesResult = (
          await ctx.db.select({ count: sql<number>`count(*)` }).from(votes)
        )[0];

        const votesCount = votesResult ? Number(votesResult.count) : 0;

        await setCache(`kv_votecount`, votesCount);

        return votesCount;
      }
    }),

  roomCount: publicProcedure
    .meta({ openapi: { method: "GET", path: "/rest/rooms/count" } })
    .input(z.void())
    .output(z.number())
    .query(async ({ ctx }) => {
      const cachedResult = await fetchCache<number>(`kv_roomcount`);

      if (cachedResult) {
        return cachedResult;
      } else {
        const roomsResult = (
          await ctx.db.select({ count: sql<number>`count(*)` }).from(rooms)
        )[0];

        const roomsCount = roomsResult ? Number(roomsResult.count) : 0;

        await setCache(`kv_roomcount`, roomsCount);

        return roomsCount;
      }
    }),
});
