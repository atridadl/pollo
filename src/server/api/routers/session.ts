import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { cacheClient, deleteFromCache } from "redicache-ts";
import { env } from "~/env.mjs";

const client = cacheClient(env.REDIS_URL);

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
        await deleteFromCache(client, env.APP_ENV, `kv_userlist_admin`);
      }

      return !!sessions;
    }),
});
