import Ably from "ably";
import { env } from "~/env.mjs";
import type { EventType } from "../utils/types";

const globalForAbly = globalThis as unknown as {
  ably: Ably.Types.RealtimePromise;
};

export const ably =
  globalForAbly.ably || new Ably.Realtime.Promise(env.ABLY_PRIVATE_KEY);

if (env.NODE_ENV !== "production") globalForAbly.ably = ably;

export const publishToChannel = async (
  ablyInstance: Ably.Types.RealtimePromise,
  channel: string,
  event: EventType,
  message: string
) => {
  const channelName = ablyInstance.channels.get(`${env.APP_ENV}-${channel}`);
  await channelName.publish(event, message);
};
