import { PrismaAdapter } from "@auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { Resend } from "resend";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { Welcome } from "../components/templates/Welcome";
import { invalidateCache } from "./redis";
import { publishToChannel } from "./ably";
import { EventTypes } from "~/utils/types";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      isAdmin: boolean;
      isVIP: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isAdmin: boolean;
    isVIP: boolean;
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
        session.user.isAdmin = user.isAdmin;
        session.user.isVIP = user.isVIP;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user && user.name && user.email) {
        await resend.sendEmail({
          from: "no-reply@sprintpadawan.dev",
          to: user.email,
          subject: "🎉 Welcome to Sprint Padawan! 🎉",
          //@ts-ignore: IDK why this doesn't work...

          react: Welcome({ name: user.name }),
        });
        await invalidateCache(`kv_userlist_admin`);
        await invalidateCache(`kv_usercount`);

        await publishToChannel(
          `stats`,
          EventTypes.STATS_UPDATE,
          JSON.stringify(user)
        );
      }
    },
    async signIn({}) {
      await invalidateCache(`kv_userlist_admin`);
    },
    async signOut() {
      await invalidateCache(`kv_userlist_admin`);
    },
  },
  // @ts-ignore This adapter should work...
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
