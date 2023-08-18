import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { validateRequest } from "./server/unkey";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "/api/public/(.*)"],
  afterAuth: async (auth, req) => {
    if (!auth.userId && auth.isPublicRoute) {
      console.log("1");
      return NextResponse.next();
    }

    if (
      req.nextUrl.pathname.includes("/api/webhooks") ||
      req.nextUrl.pathname.includes("/api/private")
    ) {
      console.log("2");
      const isValid = await validateRequest(req);
      console.log("Is Valid?: ", isValid);
      if (isValid) {
        return NextResponse.next();
      } else {
        return new NextResponse("UNAUTHORIZED", { status: 403 });
      }
    }
    if (!auth.userId && !auth.isPublicRoute) {
      console.log(req.nextUrl);
      console.log("3");
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
