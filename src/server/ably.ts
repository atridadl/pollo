import Ably from "ably";
import { env } from "~/env.mjs";
import type { EventType } from "../utils/types";

export const publishToChannel = async (
  ablyInstance: Ably.Types.RealtimePromise,
  channel: string,
  event: EventType,
  message: string
) => {
  const channelName = ablyInstance.channels.get(`${env.APP_ENV}-${channel}`);
  await channelName.publish(event, message);
};
