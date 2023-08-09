import type { User } from "@prisma/client";
import { Resend } from "resend";
import { z } from "zod";
import { Goodbye } from "~/components/templates/Goodbye";
import { env } from "~/env.mjs";
import { publishToChannel } from "~/server/ably";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { fetchCache, invalidateCache, setCache } from "~/server/redis";
import { EventTypes } from "~/utils/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export const userRouter = createTRPCRouter({
  getProviders: protectedProcedure.query(async ({ ctx }) => {
    const providers = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    return providers?.accounts.map((account) => {
      return account.provider;
    });
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const cachedResult = await fetchCache<
      {
        accounts: {
          provider: string;
        }[];
        sessions: {
          id: string;
        }[];
        id: string;
        createdAt: Date;
        isAdmin: boolean;
        isVIP: boolean;
        name: string | null;
        email: string | null;
      }[]
    >(`kv_userlist_admin`);

    if (cachedResult) {
      return cachedResult.map((user) => {
        return {
          ...user,
          createdAt: new Date(user.createdAt),
        };
      });
    } else {
      const users = await ctx.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          isAdmin: true,
          isVIP: true,
          createdAt: true,
          email: true,
          sessions: {
            select: {
              id: true,
            },
          },
          accounts: {
            select: {
              provider: true,
            },
          },
        },
      });

      await setCache(`${env.APP_ENV}_kv_userlist_admin`, users);

      return users;
    }
  }),
  delete: protectedProcedure
    .input(
      z
        .object({
          userId: z.string(),
        })
        .optional()
    )
    .mutation(async ({ ctx, input }) => {
      let user: User;
      if (input?.userId && ctx.session.user.isAdmin) {
        user = await ctx.prisma.user.delete({
          where: {
            id: input.userId,
          },
        });
      } else {
        user = await ctx.prisma.user.delete({
          where: {
            id: ctx.session.user.id,
          },
        });
      }

      if (!!user && user.name && user.email) {
        await resend.emails.send({
          from: "Sprint Padawan <no-reply@sprintpadawan.dev>",
          to: user.email,
          subject: "Sorry to see you go... 😭",
          react: Goodbye({ name: user.name }),
        });

        await invalidateCache(`kv_usercount`);
        await invalidateCache(`kv_userlist_admin`);

        await publishToChannel(
          `stats`,
          EventTypes.STATS_UPDATE,
          JSON.stringify(user)
        );
      }

      return !!user;
    }),
  save: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name,
        },
      });

      return !!user;
    }),
  setAdmin: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        value: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          isAdmin: input.value,
        },
      });

      await invalidateCache(`kv_userlist_admin`);

      return !!user;
    }),

  setVIP: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        value: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          isVIP: input.value,
        },
      });

      await invalidateCache(`kv_userlist_admin`);

      return !!user;
    }),
});
