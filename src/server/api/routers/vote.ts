import { z } from "zod";
import { publishToChannel } from "~/server/ably";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  cacheClient,
  writeToCache,
  fetchFromCache,
  deleteFromCache,
} from "redicache-ts";
import { env } from "~/env.mjs";
import type { Room } from "@prisma/client";

const client = cacheClient(env.REDIS_URL);

export const voteRouter = createTRPCRouter({
  countAll: protectedProcedure.query(async ({ ctx }) => {
    const cachedResult = await fetchFromCache<number>(
      client,
      env.APP_ENV,
      `kv_votecount_admin`
    );

    if (cachedResult) {
      return cachedResult;
    } else {
      const votesCount = await ctx.prisma.vote.count();

      await writeToCache(
        client,
        env.APP_ENV,
        `kv_votecount_admin`,
        votesCount,
        69
      );

      return votesCount;
    }
  }),
  getAllByRoomId: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const cachedResult = await fetchFromCache<
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
      >(client, env.APP_ENV, `kv_votes_${input.roomId}`);

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

        await writeToCache(
          client,
          env.APP_ENV,
          `kv_votes_${input.roomId}`,
          JSON.stringify(votesByRoomId),
          69
        );

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
        await deleteFromCache(client, env.APP_ENV, `kv_votecount_admin`);
        await deleteFromCache(client, env.APP_ENV, `kv_votes_${input.roomId}`);

        await publishToChannel(`${vote.roomId}`, "VOTE_UPDATE", "UPDATE");
      }

      return !!vote;
    }),
});
