import { z } from "zod";
import { publishToChannel } from "~/server/ably";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { env } from "~/env.mjs";
import { fetchCache, invalidateCache, setCache } from "~/server/redis";

export const roomRouter = createTRPCRouter({
  // Create
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session) {
        const room = await ctx.prisma.room.create({
          data: {
            userId: ctx.session.user.id,
            roomName: input.name,
            storyName: "First Story!",
            scale: "0.5,1,2,3,5,8",
            visible: false,
          },
        });
        if (room) {
          await invalidateCache(`kv_roomcount_admin`);
          await invalidateCache(`kv_roomlist_${ctx.session.user.id}`);

          await publishToChannel(
            `${ctx.session.user.id}`,
            "ROOM_LIST_UPDATE",
            "CREATE"
          );
        }
        // happy path
        return !!room;
      }

      // clinically depressed path
      return false;
    }),

  // Get One
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.room.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          userId: true,
          logs: true,
          roomName: true,
          storyName: true,
          visible: true,
          scale: true,
          owner: true,
        },
      });
    }),

  // Get All
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const cachedResult = await fetchCache<
      {
        id: string;
        createdAt: Date;
        roomName: string;
      }[]
    >(`kv_roomlist_${ctx.session.user.id}`);

    if (cachedResult) {
      return cachedResult;
    } else {
      const roomList = await ctx.prisma.room.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
          createdAt: true,
          roomName: true,
        },
      });

      await setCache(`kv_roomlist_${ctx.session.user.id}`, roomList);

      return roomList;
    }
  }),

  countAll: protectedProcedure.query(async ({ ctx }) => {
    const cachedResult = await fetchCache<number>(`kv_roomcount_admin`);

    if (cachedResult) {
      return cachedResult;
    } else {
      const roomsCount = await ctx.prisma.room.count();

      await setCache(`kv_roomcount_admin`, roomsCount);

      return roomsCount;
    }
  }),

  // Update One
  set: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        visible: z.boolean(),
        scale: z.string(),
        roomId: z.string(),
        reset: z.boolean(),
        log: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.reset) {
        if (input.log) {
          const oldRoom = await ctx.prisma.room.findUnique({
            where: {
              id: input.roomId,
            },
            select: {
              roomName: true,
              storyName: true,
              scale: true,
              votes: {
                select: {
                  owner: {
                    select: {
                      name: true,
                    },
                  },
                  value: true,
                },
              },
            },
          });

          oldRoom &&
            (await ctx.prisma.log.create({
              data: {
                userId: ctx.session.user.id,
                roomId: input.roomId,
                scale: oldRoom.scale,
                votes: oldRoom.votes.map((vote) => {
                  return {
                    name: vote.owner.name,
                    value: vote.value,
                  };
                }),
                roomName: oldRoom.roomName,
                storyName: oldRoom.storyName,
              },
            }));
        }

        await ctx.prisma.vote.deleteMany({
          where: {
            roomId: input.roomId,
          },
        });

        await invalidateCache(`kv_votes_${input.roomId}`);
      }

      const newRoom = await ctx.prisma.room.update({
        where: {
          id: input.roomId,
        },
        data: {
          storyName: input.name,
          userId: ctx.session.user.id,
          visible: input.visible,
          scale: [...new Set(input.scale.split(","))]
            .filter((item) => item !== "")
            .toString(),
        },
        select: {
          id: true,
          roomName: true,
          storyName: true,
          visible: true,
          scale: true,
          votes: {
            select: {
              owner: {
                select: {
                  name: true,
                },
              },
              value: true,
            },
          },
        },
      });

      if (newRoom) {
        await publishToChannel(`${newRoom.id}`, "ROOM_UPDATE", "UPDATE");
      }

      return !!newRoom;
    }),

  // Delete One
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletedRoom = await ctx.prisma.room.delete({
        where: {
          id: input.id,
        },
      });

      if (deletedRoom) {
        await invalidateCache(`kv_roomcount_admin`);
        await invalidateCache(`kv_votecount_admin`);
        await invalidateCache(`kv_roomlist_${ctx.session.user.id}`);

        await publishToChannel(
          `${ctx.session.user.id}`,
          "ROOM_LIST_UPDATE",
          "DELETE"
        );

        await publishToChannel(`${deletedRoom.id}`, "ROOM_UPDATE", "DELETE");
      }

      return !!deletedRoom;
    }),
});
