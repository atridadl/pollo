import Ably from "ably";
import type { EventType } from "../utils/types";
import { env } from "~/env.mjs";

const ably = new Ably.Realtime.Promise(env.ABLY_PRIVATE_KEY);

export const publishToChannel = async (
  channel: string,
  event: EventType,
  message: string
) => {
  const channelName = ably.channels.get(`${env.APP_ENV}-${channel}`);
  await channelName.publish(event, message);
};
