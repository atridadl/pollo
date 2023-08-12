import { validateApiKey } from "~/server/unkey";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { fetchCache, setCache } from "~/server/redis";

export const restRouter = createTRPCRouter({
  dbWarmer: publicProcedure
    .meta({ openapi: { method: "POST", path: "/rest/dbwarmer" } })
    .input(z.object({ key: z.string() }))
    .output(z.string())
    .query(async ({ ctx, input }) => {
      const isValidKey = await validateApiKey(input.key);
      if (isValidKey) {
        await ctx.prisma.vote.findMany();
        return "Toasted the DB";
      } else {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }),

  voteCount: publicProcedure
    .meta({ openapi: { method: "GET", path: "/rest/votes/count" } })
    .input(z.void())
    .output(z.number())
    .query(async ({ ctx }) => {
      const cachedResult = await fetchCache<number>(`kv_votecount`);

      if (cachedResult) {
        return cachedResult;
      } else {
        const votesCount = await ctx.prisma.vote.count();

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
        const roomsCount = await ctx.prisma.room.count();

        await setCache(`kv_roomcount`, roomsCount);

        return roomsCount;
      }
    }),
});
