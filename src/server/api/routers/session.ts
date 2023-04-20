import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { deleteFromCache } from "~/server/redis";

export const sessionRouter = createTRPCRouter({
  deleteAll: protectedProcedure
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
        await deleteFromCache(`kv_userlist_admin`);
      }

      return !!sessions;
    }),
});
