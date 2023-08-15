import type { NextApiRequest, NextApiResponse } from "next";
import { validateRequest } from "~/server/unkey";
import {
  onUserCreatedHandler,
  onUserDeletedHandler,
} from "~/server/webhookHelpers";
import { WebhookEvent, WebhookEvents } from "~/utils/types";

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
      onUserCreatedHandler(requestBody.data.id, res);
      break;

    case WebhookEvents.USER_DELETED:
      onUserDeletedHandler(requestBody.data.id, res);
      break;

    default:
      res.status(400).json({ error: "INVALID WEBHOOK EVENT" });
      break;
  }
}
