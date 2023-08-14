import { z } from "zod";

import { createTRPCRouter, keyProtectedProcedure } from "~/server/api/trpc";

export const webhookRouter = createTRPCRouter({
  onUserDelete: keyProtectedProcedure
    .meta({ openapi: { method: "POST", path: "/webhook/user/delete" } })
    .input(
      z.object({
        data: z.object({
          deleted: z.boolean(),
          id: z.string(),
          object: z.string(),
        }),
        object: z.string(),
        type: z.string(),
      })
    )
    .output(z.string())
    .query(({ input }) => {
      console.log(input.data.deleted);
      return `Deleted: ${input.data.deleted}`;
    }),
});
