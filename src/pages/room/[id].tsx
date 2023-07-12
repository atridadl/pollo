import { type GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";

import { useRouter } from "next/router";
import {
  IoCheckmarkCircleOutline,
  IoCopyOutline,
  IoDownloadOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoHourglassOutline,
  IoReloadOutline,
  IoSaveOutline,
} from "react-icons/io5";
import { z } from "zod";
import { api } from "~/utils/api";
import { getServerAuthSession } from "../../server/auth";

import { configureAbly, useChannel, usePresence } from "@ably-labs/react-hooks";
import Link from "next/link";
import { FaShieldAlt } from "react-icons/fa";
import { RiVipCrownFill } from "react-icons/ri";
import { env } from "~/env.mjs";
import { downloadCSV } from "~/utils/helpers";
import type { PresenceItem } from "~/utils/types";
import { Session } from "next-auth";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  // Redirect to login if not signed in
  if (!session) {
    return {
      redirect: {
        destination: `/api/auth/signin?callbackUrl=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  // Return session if logged in
  return {
    props: { session },
  };
};

const Room: NextPage<{ session: Session }> = ({ session }) => {
  return (
    <>
      <Head>
        <title>Sprint Padawan</title>
        <meta name="description" content="Plan. Sprint. Repeat." />
        <meta http-equiv="Cache-control" content="no-cache" />
      </Head>
      <div className="flex flex-col items-center justify-center text-center gap-2">
        <RoomBody session={session} />
      </div>
    </>
  );
};

export default Room;

const RoomBody: React.FC<{ session: Session }> = ({ session }) => {
  const { query } = useRouter();
  const roomId = z.string().parse(query.id);

  const [storyNameText, setStoryNameText] = useState<string>("");
  const [roomScale, setRoomScale] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const { data: roomFromDb, refetch: refetchRoomFromDb } =
    api.room.get.useQuery({ id: roomId });

  const { data: votesFromDb, refetch: refetchVotesFromDb } =
    api.vote.getAllByRoomId.useQuery({ roomId });

  const setVoteInDb = api.vote.set.useMutation({});
  const setRoomInDb = api.room.set.useMutation({});

  configureAbly({
    key: env.NEXT_PUBLIC_ABLY_PUBLIC_KEY,
    clientId: session.user.id,
    recover: (_, cb) => {
      cb(true);
    },
  });

  const [channel] = useChannel(
    {
      channelName: `${env.NEXT_PUBLIC_APP_ENV}-${roomId}`,
    },
    ({ name }) => {
      if (name === "ROOM_UPDATE") {
        void refetchVotesFromDb();
        void refetchRoomFromDb();
      } else if (name === "VOTE_UPDATE") {
        void refetchVotesFromDb();
      }
    }
  );

  const [presenceData] = usePresence<PresenceItem>(
    `${env.NEXT_PUBLIC_APP_ENV}-${roomId}`,
    {
      name: session.user.name || "",
      image: session.user.image || "",
      client_id: session.user.id || "",
      role: session.user.role || "USER",
    }
  );

  // Subscribe on mount and unsubscribe on unmount
  useEffect(() => {
    window.addEventListener("beforeunload", () => channel.presence.leave());
    return () => {
      window.removeEventListener("beforeunload", () =>
        channel.presence.leave()
      );
      channel.presence.leave();
    };
  }, [channel.presence, roomId]);

  // Init story name
  useEffect(() => {
    if (session && roomFromDb) {
      setStoryNameText(roomFromDb.storyName || "");
      setRoomScale(roomFromDb.scale || "ERROR");
    }
  }, [roomFromDb, roomId, session]);

  // Helper functions
  const getVoteForCurrentUser = () => {
    if (roomFromDb && session) {
      return (
        votesFromDb &&
        votesFromDb.find((vote) => vote.userId === session.user.id)
      );
    } else {
      return null;
    }
  };

  const setVote = (value: string) => {
    if (roomFromDb) {
      setVoteInDb.mutate({
        roomId: roomFromDb.id,
        value: value,
      });
    }
  };

  const saveRoom = (visible: boolean, reset = false, log = false) => {
    if (roomFromDb) {
      setRoomInDb.mutate({
        name: storyNameText,
        roomId: roomFromDb.id,
        scale: roomScale,
        visible: visible,
        reset: reset,
        log: log,
      });
    }
  };

  const downloadLogs = () => {
    if (roomFromDb && votesFromDb) {
      const jsonObject = roomFromDb?.logs
        .map((item) => {
          return {
            ...item,
            scale: item.scale,
            votes: item.votes,
            roomName: item.roomName,
            storyName: item.storyName,
          };
        })
        .concat({
          id: "LATEST",
          createdAt: new Date(),
          userId: roomFromDb.owner.id,
          roomId: roomFromDb.id,
          scale: roomScale,
          votes: votesFromDb.map((vote) => {
            return {
              name: vote.owner.name,
              value: vote.value,
            };
          }),
          roomName: roomFromDb.roomName,
          storyName: storyNameText,
        });

      downloadCSV(jsonObject, `sprint-padawan-room-${roomId}.csv`);
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
    votes: typeof votesFromDb,
    presenceItem: PresenceItem
  ) => {
    const matchedVote = votes?.find(
      (vote) => vote.userId === presenceItem.client_id
    );

    if (visible) {
      if (!!matchedVote) {
        return <p>{matchedVote.value}</p>;
      } else {
        return <IoHourglassOutline className="text-xl mx-auto text-red-400" />;
      }
    } else if (!!matchedVote) {
      return (
        <IoCheckmarkCircleOutline className="text-xl mx-auto text-green-400" />
      );
    } else {
      return (
        <IoHourglassOutline className="text-xl animate-spin mx-auto text-yellow-400" />
      );
    }
  };

  // Room is loading
  if (roomFromDb === undefined) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <span className="loading loading-dots loading-lg"></span>{" "}
      </div>
    );
    // Room has been loaded
  } else if (roomFromDb) {
    return (
      <span className="text-center">
        <div className="text-2xl">{roomFromDb.roomName}</div>
        <div className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-md mx-auto">
          <div>ID:</div>
          <div>{roomFromDb.id}</div>

          <button>
            {copied ? (
              <IoCheckmarkCircleOutline className="mx-1 text-green-400 animate-bounce" />
            ) : (
              <IoCopyOutline
                className="mx-1 hover:text-primary"
                onClick={copyRoomURLHandler}
              ></IoCopyOutline>
            )}
          </button>
        </div>

        {roomFromDb && (
          <div className="card card-compact bg-neutral shadow-xl mx-auto m-4">
            <div className="card-body">
              <h2 className="card-title mx-auto">
                Story: {roomFromDb.storyName}
              </h2>

              <ul className="p-0 mx-auto flex flex-row flex-wrap justify-center items-center text-ceter gap-4">
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
                          <div className="w-10 rounded-full avatar mx-auto">
                            <Image
                              src={presenceItem.data.image}
                              alt={`${presenceItem.data.name}'s Profile Picture`}
                              height={32}
                              width={32}
                            />
                          </div>

                          <p className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-md mx-auto">
                            {presenceItem.data.name}{" "}
                            {presenceItem.data.role === "ADMIN" && (
                              <div
                                className="tooltip tooltip-primary"
                                data-tip="Admin"
                              >
                                <FaShieldAlt className="inline-block text-primary" />
                              </div>
                            )}{" "}
                            {presenceItem.clientId === roomFromDb.userId && (
                              <div
                                className="tooltip tooltip-warning"
                                data-tip="Room Owner"
                              >
                                <RiVipCrownFill className="inline-block text-yellow-500" />
                              </div>
                            )}
                            {" : "}
                          </p>

                          {roomFromDb &&
                            votesFromDb &&
                            voteString(
                              roomFromDb.visible,
                              votesFromDb,
                              presenceItem.data
                            )}
                        </li>
                      );
                    })}
              </ul>

              <div className="join md:btn-group-horizontal mx-auto">
                {roomFromDb.scale.split(",").map((scaleItem, index) => {
                  return (
                    <button
                      key={index}
                      className={`join-item ${
                        getVoteForCurrentUser()?.value === scaleItem
                          ? "btn btn-active btn-primary"
                          : "btn"
                      }`}
                      onClick={() => setVote(scaleItem)}
                    >
                      {scaleItem}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {session && !!roomFromDb && roomFromDb.userId === session.user.id && (
          <>
            <div className="card card-compact bg-neutral shadow-xl mx-auto m-4">
              <div className="card-body flex flex-col flex-wrap">
                <h2 className="card-title mx-auto">Room Settings</h2>

                <label className="label mx-auto">
                  {"Vote Scale (Comma Separated):"}{" "}
                </label>

                <input
                  type="text"
                  placeholder="Scale (Comma Separated)"
                  className="input input-bordered m-auto"
                  value={roomScale}
                  onChange={(event) => {
                    setRoomScale(event.target.value);
                  }}
                />

                <label className="label mx-auto">{"Story Name:"} </label>

                <input
                  type="text"
                  placeholder="Story Name"
                  className="input input-bordered m-auto"
                  value={storyNameText}
                  onChange={(event) => {
                    setStoryNameText(event.target.value);
                  }}
                />

                <div className="flex flex-row flex-wrap text-center items-center justify-center gap-2">
                  <div>
                    <button
                      onClick={() => saveRoom(!roomFromDb.visible, false)}
                      className="btn btn-primary inline-flex"
                    >
                      {roomFromDb.visible ? (
                        <>
                          <IoEyeOffOutline className="text-xl mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <IoEyeOutline className="text-xl mr-1" />
                          Show
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <button
                      onClick={() =>
                        saveRoom(
                          false,
                          true,
                          roomFromDb.storyName === storyNameText ||
                            votesFromDb?.length === 0
                            ? false
                            : true
                        )
                      }
                      className="btn btn-primary inline-flex"
                      disabled={
                        [...new Set(roomScale.split(","))].filter(
                          (item) => item !== ""
                        ).length <= 1
                      }
                    >
                      {roomFromDb.storyName === storyNameText ||
                      votesFromDb?.length === 0 ? (
                        <>
                          <IoReloadOutline className="text-xl mr-1" /> Reset
                        </>
                      ) : (
                        <>
                          <IoSaveOutline className="text-xl mr-1" /> Save
                        </>
                      )}
                    </button>
                  </div>

                  {votesFromDb &&
                    (roomFromDb.logs.length > 0 || votesFromDb.length > 0) && (
                      <div>
                        <button
                          onClick={() => downloadLogs()}
                          className="btn btn-primary inline-flex hover:animate-pulse"
                        >
                          <>
                            <IoDownloadOutline className="text-xl" />
                          </>
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </>
        )}
      </span>
    );
    // Room does not exist
  } else {
    return (
      <span className="text-center">
        <h1 className="text-5xl font-bold m-2">4️⃣0️⃣4️⃣</h1>
        <h1 className="text-5xl font-bold m-2">
          Oops! This room does not appear to exist, or may have been deleted! 😢
        </h1>
        <Link
          about="Back to home."
          href="/"
          className="btn btn-secondary normal-case text-xl m-2"
        >
          Back to Home
        </Link>
      </span>
    );
  }
};
