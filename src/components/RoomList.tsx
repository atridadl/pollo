import { useSession } from "next-auth/react";
import Link from "next/link";

import { api } from "~/utils/api";
import { IoEnterOutline, IoTrashBinOutline } from "react-icons/io5";
import { configureAbly, useChannel } from "@ably-labs/react-hooks";
import { env } from "~/env.mjs";
import Loading from "./Loading";
import { useState } from "react";

const RoomList: React.FC = () => {
  const { data: sessionData } = useSession();

  configureAbly({
    key: env.NEXT_PUBLIC_ABLY_PUBLIC_KEY,
    clientId: sessionData?.user.id,
    recover: (_, cb) => {
      cb(true);
    },
  });

  const [] = useChannel(
    `${env.NEXT_PUBLIC_APP_ENV}-${sessionData ? sessionData.user.id : ""}`,
    () => void refetchRoomsFromDb()
  );

  const [roomName, setRoomName] = useState<string>("");

  const { data: roomsFromDb, refetch: refetchRoomsFromDb } =
    api.room.getAll.useQuery(undefined, {
      enabled: sessionData?.user !== undefined,
    });

  const createRoom = api.room.create.useMutation({});

  const createRoomHandler = () => {
    createRoom.mutate({ name: roomName });
    setRoomName("");
    (document.querySelector("#roomNameInput") as HTMLInputElement).value = "";
    (document.querySelector("#new-room-modal") as HTMLInputElement).checked =
      false;
  };

  const deleteRoom = api.room.delete.useMutation({});

  const deleteRoomHandler = (roomId: string) => {
    if (sessionData) {
      deleteRoom.mutate({ id: roomId });
    }
  };

  return (
    <div className="prose flex flex-col items-center justify-center">
      {/* Modal for Adding Rooms */}
      <input type="checkbox" id="new-room-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box flex-col flex text-center justify-center items-center">
          <label
            htmlFor="new-room-modal"
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            ✕
          </label>

          <h3 className="font-bold text-lg">Create a new room!</h3>

          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Room Name</span>
            </label>
            <input
              id="roomNameInput"
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
              onChange={(event) => {
                setRoomName(event.target.value);
              }}
            />
          </div>

          <div className="modal-action">
            {roomName.length > 0 && (
              <label
                htmlFor="new-room-modal"
                className="btn btn-primary"
                onClick={() => createRoomHandler()}
              >
                Submit
              </label>
            )}
          </div>
        </div>
      </div>

      {roomsFromDb && roomsFromDb.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-center break-all">
            {/* head */}
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {roomsFromDb?.map((room) => {
                return (
                  <tr key={room.id}>
                    <td className="break-all max-w-[200px] md:max-w-[400px]">
                      {room.roomName}
                    </td>
                    <td>
                      <Link
                        className="m-2 no-underline"
                        href={`/room/${room.id}`}
                      >
                        <IoEnterOutline className="text-xl inline-block hover:text-secondary" />
                      </Link>

                      <button
                        className="m-2"
                        onClick={() => deleteRoomHandler(room.id)}
                      >
                        <IoTrashBinOutline className="text-xl inline-block hover:text-error" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <label htmlFor="new-room-modal" className="btn btn-secondary">
        New Room
      </label>

      {roomsFromDb === undefined && (
        <div className="flex items-center justify-center">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default RoomList;