import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunction, redirect } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { AblyProvider, useChannel, usePresence } from "ably/react";
import * as Ably from "ably";
import {
  CheckCircleIcon,
  CopyIcon,
  CrownIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  HourglassIcon,
  RefreshCwIcon,
  SaveIcon,
  ShieldIcon,
  StarIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import LoadingIndicator from "~/components/LoadingIndicator";
import { useEventSource } from "remix-utils/sse/react";
import {
  EventTypes,
  PresenceItem,
  RoomResponse,
  VoteResponse,
} from "~/services/types";
import { isAdmin, isVIP, jsonToCsv } from "~/services/helpers";
import { useUser } from "@clerk/remix";

export const loader: LoaderFunction = async (args) => {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect("/sign-in");
  }
  return {};
};

function RoomContent() {
  const { user } = useUser();
  const params = useParams();
  const roomId = params.roomId;

  let roomFromDb = useEventSource("/api/room/get", { event: params.roomId });
  let votesFromDb = useEventSource("/api/votes/get/all", {
    event: params.roomId,
  });

  let roomFromDbParsed = JSON.parse(roomFromDb!) as RoomResponse;
  let votesFromDbParsed = JSON.parse(votesFromDb!) as VoteResponse;

  const [storyNameText, setStoryNameText] = useState<string>("");
  const [roomScale, setRoomScale] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Handlers
  // =================================
  async function getRoomHandler() {
    const response = await fetch(`/api/internal/room/${roomId}`, {
      cache: "no-cache",
      method: "GET",
    });

    return (await response.json()) as RoomResponse;
  }

  async function getVotesHandler() {
    const dbVotesResponse = await fetch(`/api/internal/room/${roomId}/votes`, {
      cache: "no-cache",
      method: "GET",
    });
    const dbVotes = (await dbVotesResponse.json()) as VoteResponse;
    return dbVotes;
  }

  async function setVoteHandler(value: string) {
    if (roomFromDb) {
      await fetch(`/api/internal/room/${roomId}/vote`, {
        cache: "no-cache",
        method: "PUT",
        body: JSON.stringify({
          value,
        }),
      });
    }
  }

  async function setRoomHandler(data: {
    visible: boolean;
    reset: boolean | undefined;
    log: boolean | undefined;
  }) {
    if (roomFromDb) {
      await fetch(`/api/internal/room/${roomId}`, {
        cache: "no-cache",
        method: "PUT",
        body: JSON.stringify({
          name: storyNameText,
          visible: data.visible,
          scale: roomScale,
          reset: data.reset ? data.reset : false,
          log: data.log ? data.log : false,
        }),
      });
    }
  }

  // Helpers
  // =================================
  const getVoteForCurrentUser = () => {
    if (roomFromDb) {
      return (
        votesFromDbParsed &&
        votesFromDbParsed.find((vote) => vote.userId === user?.id)
      );
    } else {
      return null;
    }
  };

  const downloadLogs = () => {
    if (roomFromDb && votesFromDb) {
      const jsonObject = roomFromDbParsed?.logs
        .map((item) => {
          return {
            id: item.id,
            created_at: item.created_at,
            userId: item.userId,
            roomId: item.roomId,
            roomName: item.roomName,
            storyName: item.storyName,
            scale: item.scale,
            votes: item.votes,
          };
        })
        .concat({
          id: "LATEST",
          created_at: new Date(),
          userId: roomFromDbParsed.userId,
          roomId: roomFromDbParsed.id,
          roomName: roomFromDbParsed.roomName,
          storyName: storyNameText,
          scale: roomScale,
          votes: votesFromDbParsed?.map((vote) => {
            return {
              value: vote.value,
            };
          }),
        });

      jsonToCsv(jsonObject!, `sp_${roomId}.csv`);
    }
  };

  const copyRoomURLHandler = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        console.log(`Copied Room Link to Clipboard!`);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(() => {
        console.log(`Error Copying Room Link to Clipboard!`);
      });
  };

  const voteString = (
    visible: boolean,
    votes: typeof votesFromDbParsed,
    presenceItem: PresenceItem
  ) => {
    const matchedVote = votes?.find(
      (vote) => vote.userId === presenceItem.client_id
    );

    if (visible) {
      if (!!matchedVote) {
        return <div>{matchedVote.value}</div>;
      } else {
        return <HourglassIcon className="text-xl text-error" />;
      }
    } else if (!!matchedVote) {
      return <CheckCircleIcon className="text-xl text-success" />;
    } else {
      return <HourglassIcon className="text-xl animate-spin text-warning" />;
    }
  };

  // Hooks
  // =================================
  useChannel(
    {
      channelName: `${process.env.APP_ENV}-${roomId}`,
    },
    ({ name }: { name: string }) => {
      if (name === EventTypes.ROOM_UPDATE) {
        void getRoomHandler();
        void getVotesHandler();
      } else if (name === EventTypes.VOTE_UPDATE) {
        void getVotesHandler();
      }
    }
  );

  const { presenceData } = usePresence<PresenceItem>(
    `${process.env.APP_ENV}-${roomId}`,
    {
      name: (user?.fullName ?? user?.username) || "",
      image: user?.imageUrl || "",
      client_id: user?.id || "unknown",
      isAdmin: isAdmin(user?.publicMetadata),
      isVIP: isVIP(user?.publicMetadata),
    }
  );

  useEffect(() => {
    if (roomFromDb) {
      setStoryNameText(roomFromDbParsed?.storyName || "");
      setRoomScale(roomFromDbParsed?.scale || "ERROR");
    }
  }, [roomFromDb]);

  // UI
  // =================================
  // Room is loading
  if (!roomFromDbParsed) {
    return <LoadingIndicator />;
    // Room has been loaded
  } else {
    return roomFromDb ? (
      <div className="flex flex-col gap-4 text-center justify-center items-center">
        <div className="text-2xl">{roomFromDbParsed.roomName}</div>
        <div className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-md">
          <div>ID:</div>
          <div>{roomFromDbParsed.id}</div>

          <button>
            {copied ? (
              <CheckCircleIcon className="mx-1 text-success animate-bounce" />
            ) : (
              <CopyIcon
                className="mx-1 hover:text-primary"
                onClick={copyRoomURLHandler}
              />
            )}
          </button>
        </div>

        {roomFromDb && (
          <div className="card card-compact bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mx-auto">
                Story: {roomFromDbParsed.storyName}
              </h2>

              <ul className="p-0 flex flex-row flex-wrap justify-center items-center text-ceter gap-4">
                {presenceData &&
                  presenceData
                    .filter(
                      (value, index, self) =>
                        index ===
                        self.findIndex(
                          (presenceItem) =>
                            presenceItem.clientId === value.clientId
                        )
                    )
                    .map((presenceItem) => {
                      return (
                        <li
                          key={presenceItem.clientId}
                          className="flex flex-row items-center justify-center gap-2"
                        >
                          <div className="w-10 rounded-full avatar">
                            <img
                              src={presenceItem.data.image}
                              alt={`${presenceItem.data.name}'s Profile Picture`}
                              height={32}
                              width={32}
                            />
                          </div>

                          <p className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-md">
                            {presenceItem.data.name}{" "}
                            {presenceItem.data.isAdmin && (
                              <span
                                className="tooltip tooltip-primary"
                                data-tip="Admin"
                              >
                                <ShieldIcon className="inline-block text-primary" />
                              </span>
                            )}{" "}
                            {presenceItem.data.isVIP && (
                              <span
                                className="tooltip tooltip-secondary"
                                data-tip="VIP"
                              >
                                <StarIcon className="inline-block text-secondary" />
                              </span>
                            )}{" "}
                            {presenceItem.clientId ===
                              roomFromDbParsed?.userId && (
                              <span
                                className="tooltip tooltip-warning"
                                data-tip="Room Owner"
                              >
                                <CrownIcon className="inline-block text-yellow-500" />
                              </span>
                            )}
                            {" : "}
                          </p>

                          {roomFromDb &&
                            votesFromDb &&
                            voteString(
                              roomFromDbParsed?.visible!,
                              votesFromDbParsed,
                              presenceItem.data
                            )}
                        </li>
                      );
                    })}
              </ul>

              <div className="join md:btn-group-horizontal mx-auto">
                {roomFromDbParsed.scale?.split(",").map((scaleItem, index) => {
                  return (
                    <button
                      key={index}
                      className={`join-item ${
                        getVoteForCurrentUser()?.value === scaleItem
                          ? "btn btn-active btn-primary"
                          : "btn"
                      }`}
                      onClick={() => void setVoteHandler(scaleItem)}
                    >
                      {scaleItem}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!!roomFromDbParsed &&
          (roomFromDbParsed.userId === user?.id ||
            isAdmin(user?.publicMetadata)) && (
            <>
              <div className="card card-compact bg-base-100 shadow-xl">
                <div className="card-body flex flex-col flex-wrap">
                  <h2 className="card-title">Room Settings</h2>

                  <label className="label">
                    {"Vote Scale (Comma Separated):"}{" "}
                  </label>

                  <input
                    type="text"
                    placeholder="Scale (Comma Separated)"
                    className="input input-bordered"
                    value={roomScale}
                    onChange={(event) => {
                      setRoomScale(event.target.value);
                    }}
                  />

                  <label className="label">{"Story Name:"} </label>

                  <input
                    type="text"
                    placeholder="Story Name"
                    className="input input-bordered"
                    value={storyNameText}
                    onChange={(event) => {
                      setStoryNameText(event.target.value);
                    }}
                  />

                  <div className="flex flex-row flex-wrap text-center items-center justify-center gap-2">
                    <div>
                      <button
                        onClick={() =>
                          void setRoomHandler({
                            visible: !roomFromDbParsed?.visible,
                            reset: false,
                            log: false,
                          })
                        }
                        className="btn btn-primary inline-flex"
                      >
                        {roomFromDbParsed.visible ? (
                          <>
                            <EyeOffIcon className="text-xl mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <EyeIcon className="text-xl mr-1" />
                            Show
                          </>
                        )}
                      </button>
                    </div>

                    <div>
                      <button
                        onClick={() =>
                          void setRoomHandler({
                            visible: false,
                            reset: true,
                            log:
                              roomFromDbParsed?.storyName === storyNameText ||
                              votesFromDb?.length === 0
                                ? false
                                : true,
                          })
                        }
                        className="btn btn-primary inline-flex"
                        disabled={
                          [...new Set(roomScale.split(","))].filter(
                            (item) => item !== ""
                          ).length <= 1
                        }
                      >
                        {roomFromDbParsed?.storyName === storyNameText ||
                        votesFromDb?.length === 0 ? (
                          <>
                            <RefreshCwIcon className="text-xl mr-1" /> Reset
                          </>
                        ) : (
                          <>
                            <SaveIcon className="text-xl mr-1" /> Save
                          </>
                        )}
                      </button>
                    </div>

                    {votesFromDb &&
                      (roomFromDbParsed?.logs.length > 0 ||
                        votesFromDb.length > 0) && (
                        <div>
                          <button
                            onClick={() => downloadLogs()}
                            className="btn btn-primary inline-flex hover:animate-pulse"
                          >
                            <>
                              <DownloadIcon className="text-xl" />
                            </>
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </>
          )}
      </div>
    ) : (
      <span className="text-center">
        <h1 className="text-5xl font-bold m-2">4️⃣0️⃣4️⃣</h1>
        <h1 className="text-5xl font-bold m-2">
          Oops! This room does not appear to exist, or may have been deleted! 😢
        </h1>
        <Link
          about="Back to home."
          to="/"
          className="btn btn-secondary normal-case text-xl m-2"
        >
          Back to Home
        </Link>
      </span>
    );
  }
}

export default function Room() {
  const client = new Ably.Realtime.Promise({
    authUrl: "/api/ably",
  });

  return (
    <AblyProvider client={client}>
      <RoomContent />
    </AblyProvider>
  );
}
