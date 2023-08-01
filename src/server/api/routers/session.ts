import { z } from "zod";
import { adminRateLimitedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { invalidateCache } from "~/server/redis";

export const sessionRouter = createTRPCRouter({
  deleteAllByUserId: adminRateLimitedProcedure
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
  deleteAll: adminRateLimitedProcedure.mutation(async ({ ctx }) => {
    const sessions = await ctx.prisma.session.deleteMany();

    if (!!sessions) {
      await invalidateCache(`kv_userlist_admin`);
    }

    return !!sessions;
  }),
});
