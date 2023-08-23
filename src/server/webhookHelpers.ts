import { eq } from "drizzle-orm";
import { db } from "./db";
import { rooms } from "./schema";
import { env } from "~/env.mjs";
import { Welcome } from "~/components/templates/Welcome";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

export const onUserDeletedHandler = async (userId: string) => {
  try {
    await db.delete(rooms).where(eq(rooms.userId, userId));

    return true;
  } catch (error) {
    return false;
  }
};

export const onUserCreatedHandler = async (
  userId: string,
  userName: string,
  userEmails: string[]
) => {
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

  userEmails.forEach((userEmail) => {
    void resend.sendEmail({
      from: "no-reply@sprintpadawan.dev",
      to: userEmail,
      subject: "🎉 Welcome to Sprint Padawan! 🎉",
      react: Welcome({ name: userName }),
    });
  });

  return userUpdateResponse.ok;
};
