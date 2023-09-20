"use client";

import { SignUp } from "@clerk/nextjs";

export const dynamic = "force-static";

const SignUpPage = () => (
  <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
);

export default SignUpPage;
