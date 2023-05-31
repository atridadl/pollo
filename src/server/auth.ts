import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import type { Role } from "~/utils/types";
import { sendMail } from "fms-ts";
import { cacheClient, deleteFromCache } from "redicache-ts";

const client = cacheClient(env.REDIS_URL);

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user && user.name && user.email) {
        const subject = "🎉 Welcome to Sprint Padawan! 🎉";

        const body =
          `Hi ${user.name}! \n\n` +
          "Thank you for signing up for Sprint Padawan! \n" +
          "If at any point you encounter issues, please let me know at support@sprintpadawan.dev. \n" +
          "-- \n" +
          "Sprint Padawan Admin - Atridad \n";

        await sendMail(
          env.JMAP_USERNAME,
          env.JMAP_TOKEN,
          subject,
          body,
          user.email
        );
        await deleteFromCache(client, env.APP_ENV, `kv_userlist_admin`);
        await deleteFromCache(client, env.APP_ENV, `kv_usercount_admin`);
      }
    },
    async signIn({}) {
      await deleteFromCache(client, env.APP_ENV, `kv_userlist_admin`);
    },
    async signOut() {
      await deleteFromCache(client, env.APP_ENV, `kv_userlist_admin`);
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
