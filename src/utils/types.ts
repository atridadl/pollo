type BetterEnum<T> = T[keyof T];

const EventTypes = {
  ROOM_LIST_UPDATE: "ROOM_LIST_UPDATE",
  ROOM_UPDATE: "ROOM_UPDATE",
  VOTE_UPDATE: "VOTE_UPDATE",
} as const;
export type EventType = BetterEnum<typeof EventTypes>;

export interface PresenceItem {
  name: string;
  image: string;
  client_id: string;
  isAdmin: boolean;
  isVIP: boolean;
}
