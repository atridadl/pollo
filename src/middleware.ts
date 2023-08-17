import { authMiddleware } from "@clerk/nextjs";
import { validateRequest } from "./server/unkey";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "/api/(.*)"],
  beforeAuth: async (req) => {
    if (req.nextUrl.pathname.startsWith("/api/external")) {
      const isValid = await validateRequest(req);
      console.log("Is Valid?: ", isValid);
      if (isValid) {
        return NextResponse.next();
      }
      return new NextResponse("UNAUTHORIZED", { status: 403 });
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
