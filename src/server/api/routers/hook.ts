import { validateApiKey } from "~/server/unkey";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const hookRouter = createTRPCRouter({
  dbWarmer: publicProcedure
    .meta({ openapi: { method: "POST", path: "/rest/dbwarmer" } })
    .input(z.object({ key: z.string() }))
    .output(z.string())
    .query(async ({ ctx, input }) => {
      const isValidKey = await validateApiKey(input.key);
      if (isValidKey) {
        await ctx.prisma.verificationToken.findMany();
        return "Toasted the DB";
      } else {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }),
});
