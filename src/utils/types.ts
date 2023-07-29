type BetterEnum<T> = T[keyof T];

const EventTypes = {
  ROOM_LIST_UPDATE: "ROOM_LIST_UPDATE",
  ROOM_UPDATE: "ROOM_UPDATE",
  VOTE_UPDATE: "VOTE_UPDATE",
} as const;
export type EventType = BetterEnum<typeof EventTypes>;

const RoleValues = {
  ADMIN: "ADMIN",
  USER: "USER",
  MATT: "MATT",
} as const;
export type Role = BetterEnum<typeof RoleValues>;

export interface PresenceItem {
  name: string;
  image: string;
  client_id: string;
  role: Role;
}
