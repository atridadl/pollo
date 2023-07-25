import Ably from "ably";
import { env } from "~/env.mjs";
import type { EventType } from "../utils/types";

const ablyRest = new Ably.Rest(env.ABLY_PRIVATE_KEY);

export const publishToChannel = (
  channel: string,
  event: EventType,
  message: string
) => {
  try {
    ablyRest.channels.get(`${env.APP_ENV}-${channel}`).publish(event, message);
  } catch (error) {
    console.log(`❌❌❌ Failed to send message!`);
  }
};
