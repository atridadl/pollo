"use client";

import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-static";

const SignInPage = () => (
  <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
);

export default SignInPage;
