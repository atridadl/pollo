import type { NextApiRequest, NextApiResponse } from "next";
import { validateRequest } from "~/server/unkey";
import {
  onUserCreatedHandler,
  onUserDeletedHandler,
} from "~/server/webhookHelpers";
import { type WebhookEvent, WebhookEvents } from "~/utils/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const isValid = await validateRequest(req, res);

  if (!isValid) {
    return;
  }

  const requestBody = req.body as {
    data: {
      id: string;
      email_addresses:
        | [
            {
              email_address: string;
              id: string;
              verification: {
                status: string;
                strategy: string;
              };
            }
          ]
        | null;
    };
    type: WebhookEvent;
  };

  switch (requestBody.type) {
    case WebhookEvents.USER_CREATED:
      await onUserCreatedHandler(requestBody.data.id, res);
      return;

    case WebhookEvents.USER_DELETED:
      await onUserDeletedHandler(requestBody.data.id, res);
      return;

    default:
      res.status(400).json({ error: "INVALID WEBHOOK EVENT" });
      return;
  }
}
