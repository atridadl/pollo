import { eq } from "drizzle-orm";
import { db } from "../_lib/db";
import { rooms } from "../_lib/schema";
import { env } from "env.mjs";
import { track } from "@vercel/analytics/server";

export const onUserDeletedHandler = async (userId: string | undefined) => {
  if (!userId) {
    return false;
  }

  try {
    await db.delete(rooms).where(eq(rooms.userId, userId));

    track("User Deleted");
    return true;
  } catch (error) {
    return false;
  }
};

export const onUserCreatedHandler = async (userId: string | undefined) => {
  if (!userId) {
    return false;
  }

  const userUpdateResponse = await fetch(
    `https://api.clerk.com/v1/users/${userId}/metadata`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_metadata: {
          isVIP: false,
          isAdmin: false,
        },
        private_metadata: {},
        unsafe_metadata: {},
      }),
    }
  );

  if (userUpdateResponse.ok) {
    track("User Created");
  }

  return userUpdateResponse.ok;
};
