import type { User } from "@prisma/client";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { Role } from "~/utils/types";
import { Resend } from "resend";
import { Goodbye } from "~/components/templates/Goodbye";

import { setCache, fetchCache, invalidateCache } from "~/server/redis";

const resend = new Resend(process.env.RESEND_API_KEY);

export const userRouter = createTRPCRouter({
  countAll: protectedProcedure.query(async ({ ctx }) => {
    const cachedResult = await fetchCache<number>(`kv_usercount_admin`);

    if (cachedResult) {
      return cachedResult;
    } else {
      const usersCount = await ctx.prisma.user.count();

      await setCache(`kv_usercount_admin`, usersCount);

      return usersCount;
    }
  }),

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
        role: Role;
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
          role: true,
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
      if (input?.userId && ctx.session.user.role === "ADMIN") {
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
        await resend.sendEmail({
          from: "no-reply@sprintpadawan.dev",
          to: user.email,
          subject: "Sorry to see you go... 😭",
          //@ts-ignore: IDK why this doesn't work...
          react: Goodbye({ name: user.name }),
        });

        await invalidateCache(`kv_usercount_admin`);
        await invalidateCache(`kv_userlist_admin`);
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
  setRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.union([z.literal("ADMIN"), z.literal("USER")]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          role: input.role,
        },
      });

      await invalidateCache(`kv_userlist_admin`);

      return !!user;
    }),
});
