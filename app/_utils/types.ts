type BetterEnum<T> = T[keyof T];

export const EventTypes = {
  ROOM_LIST_UPDATE: "room.list.update",
  ROOM_UPDATE: "room.update",
  VOTE_UPDATE: "vote.update",
  STATS_UPDATE: "stats.update",
} as const;
export type EventType = BetterEnum<typeof EventTypes>;

export interface PresenceItem {
  name: string;
  image: string;
  client_id: string;
  isAdmin: boolean;
  isVIP: boolean;
}

export type RoomsResponse =
  | {
      id: string;
      createdAt: Date;
      roomName: string;
    }[]
  | {
      roomName: string | null;
      id: string;
      created_at: Date | null;
      userId: string;
      storyName: string | null;
      visible: boolean;
      scale: string;
    }[]
  | null
  | undefined;

export type RoomResponse =
  | {
      id: string;
      created_at: Date | null;
      userId: string;
      roomName: string | null;
      storyName: string | null;
      visible: boolean;
      scale: string | null;
      logs: {
        id: string;
        created_at: Date | null;
        userId: string;
        roomId: string;
        roomName: string | null;
        storyName: string | null;
        scale: string | null;
        votes: unknown;
      }[];
    }
  | undefined
  | null;

export type VoteResponse =
  | {
      id: string;
      value: string;
      created_at: Date | null;
      userId: string;
      roomId: string;
    }[]
  | null
  | undefined;

export type AblyTokenResponse = {
  token: string;
  issued: number;
  expires: number;
  capability: string;
  clientId: string;
};
