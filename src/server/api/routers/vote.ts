import { z } from "zod";
import { publishToChannel } from "~/server/ably";

import type { Room } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { fetchCache, invalidateCache, setCache } from "~/server/redis";

export const voteRouter = createTRPCRouter({
  countAll: protectedProcedure.query(async ({ ctx }) => {
    const cachedResult = await fetchCache<number>(`kv_votecount_admin`);

    if (cachedResult) {
      return cachedResult;
    } else {
      const votesCount = await ctx.prisma.vote.count();

      await setCache(`kv_votecount_admin`, votesCount);

      return votesCount;
    }
  }),
  getAllByRoomId: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const cachedResult = await fetchCache<
        {
          value: string;
          room: Room;
          id: string;
          createdAt: Date;
          userId: string;
          owner: {
            name: string | null;
          };
          roomId: string;
        }[]
      >(`kv_votes_${input.roomId}`);

      if (cachedResult) {
        return cachedResult;
      } else {
        const votesByRoomId = await ctx.prisma.vote.findMany({
          where: {
            roomId: input.roomId,
          },
          select: {
            id: true,
            createdAt: true,
            owner: {
              select: {
                name: true,
              },
            },
            room: true,
            roomId: true,
            userId: true,
            value: true,
          },
        });

        await setCache(`kv_votes_${input.roomId}`, votesByRoomId);

        return votesByRoomId;
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
        await invalidateCache(`kv_votecount_admin`);
        await invalidateCache(`kv_votes_${input.roomId}`);

        publishToChannel(`${vote.roomId}`, "VOTE_UPDATE", "UPDATE");
      }

      return !!vote;
    }),
});
