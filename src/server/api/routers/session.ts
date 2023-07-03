import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";
import { invalidateCache } from "~/server/redis";

export const sessionRouter = createTRPCRouter({
  deleteAllByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sessions = await ctx.prisma.session.deleteMany({
        where: {
          userId: input.userId,
        },
      });

      if (!!sessions) {
        await invalidateCache(`kv_userlist_admin`);
      }

      return !!sessions;
    }),
  deleteAll: protectedProcedure.mutation(async ({ ctx, input }) => {
    const sessions = await ctx.prisma.session.deleteMany();

    if (!!sessions) {
      await invalidateCache(`kv_userlist_admin`);
    }

    return !!sessions;
  }),
});
