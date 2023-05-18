import { z } from "zod";
import { publishToChannel } from "~/server/ably";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { deleteFromCache, fetchFromCache, writeToCache } from "~/server/redis";

export const voteRouter = createTRPCRouter({
  countAll: protectedProcedure.query(async ({ ctx }) => {
    const cachedResult = await fetchFromCache<number>(`kv_votecount_admin`);

    if (cachedResult) {
      return cachedResult;
    } else {
      const votesCount = await ctx.prisma.vote.count();

      await writeToCache(`kv_votecount_admin`, votesCount, 69);

      return votesCount;
    }
  }),
  set: protectedProcedure
    .input(z.object({ value: z.string(), roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const vote = await ctx.prisma.vote.upsert({
        where: {
          userId_roomId: {
            roomId: input.roomId,
            userId: ctx.session.user.id,
          },
        },
        create: {
          value: input.value,
          userId: ctx.session.user.id,
          roomId: input.roomId,
        },
        update: {
          value: input.value,
          userId: ctx.session.user.id,
          roomId: input.roomId,
        },
        select: {
          value: true,
          userId: true,
          roomId: true,
          id: true,
          owner: {
            select: {
              name: true,
            },
          },
        },
      });

      if (vote) {
        await deleteFromCache(`kv_votecount_admin`);

        await publishToChannel(`${vote.roomId}`, "VOTE_UPDATE", "UPDATE");
      }

      return !!vote;
    }),
});