import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { validateRequest } from "~/server/unkey";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const success = await validateRequest(req, res);

  if (success) {
    const requestBody = req.body as {
      data: {
        id: string;
        email_addresses: [
          {
            email_address: string;
            id: string;
            verification: {
              status: string;
              strategy: string;
            };
          }
        ];
      };
      object: string;
      type: string;
    };

    const userUpdateResponse = await fetch(
      `https://api.clerk.com/v1/users/${requestBody.data.id}/metadata`,
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

    if (userUpdateResponse.status === 200) {
      res.status(200).json({ result: "METADATA UPDATED" });
    } else {
      res.status(500).json({ error: "ERROR UPDATING METADATA" });
    }
  }
}
