import type { User } from "@prisma/client";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { sendMail } from "fms-ts";
import type { Role } from "~/utils/types";

import {
  cacheClient,
  writeToCache,
  fetchFromCache,
  deleteFromCache,
} from "redicache-ts";

const client = cacheClient(env.REDIS_URL);

export const userRouter = createTRPCRouter({
  countAll: protectedProcedure.query(async ({ ctx }) => {
    const cachedResult = await fetchFromCache<number>(
      client,
      env.APP_ENV,
      `kv_usercount_admin`
    );

    if (cachedResult) {
      return cachedResult;
    } else {
      const usersCount = await ctx.prisma.user.count();

      await writeToCache(
        client,
        env.APP_ENV,
        `kv_usercount_admin`,
        usersCount,
        69
      );

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
    const cachedResult = await fetchFromCache<
      {
        sessions: {
          id: string;
        }[];
        id: string;
        createdAt: Date;
        role: Role;
        name: string | null;
        email: string | null;
      }[]
    >(client, env.APP_ENV, `kv_userlist_admin`);

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
        },
      });

      await writeToCache(
        client,
        env.APP_ENV,
        `kv_userlist_admin`,
        JSON.stringify(users),
        69
      );

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
        const subject = "Sorry to see you go... 😭";

        const body =
          `Hi ${user.name}! \n\n` +
          "We're sorry to see you go! \n" +
          "Your data has been deleted, including all room history, user data, votes, etc. \n" +
          "-- \n" +
          "Sprint Padawan Admin - Atridad \n";

        await sendMail(
          env.JMAP_USERNAME,
          env.JMAP_TOKEN,
          subject,
          body,
          user.email
        );
        await deleteFromCache(client, env.APP_ENV, `kv_usercount_admin`);
        await deleteFromCache(client, env.APP_ENV, `kv_userlist_admin`);
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

      await deleteFromCache(client, env.APP_ENV, `kv_userlist_admin`);

      return !!user;
    }),
});
