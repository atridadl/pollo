import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "~/server/trpc";
import { createTRPCContext } from "~/server/trpc/trpc";

export const runtime = "edge";
export const preferredRegion = ["pdx1"];

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    batching: {
      enabled: false,
    },
  });

export { handler as GET, handler as POST };
