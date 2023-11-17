import type { NextPage } from "next";
import Head from "next/head";

import RoomList from "~/components/RoomList";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaShieldAlt } from "react-icons/fa";
import { GiStarFormation } from "react-icons/gi";
import { useUser } from "@clerk/nextjs";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Sprint Padawan</title>
        <meta name="description" content="Plan. Sprint. Repeat." />
      </Head>
      <div className="flex flex-col text-center items-center justify-center px-4 py-16 gap-4">
        <HomePageBody />
      </div>
    </>
  );
};

export default Home;

const HomePageBody = () => {
  const { isLoaded, user } = useUser();
  const [joinRoomTextBox, setJoinRoomTextBox] = useState<string>("");
  const [tabIndex, setTabIndex] = useState<number>();

  useEffect(() => {
    const tabIndexLocal = localStorage.getItem(`dashboardTabIndex`);
    setTabIndex(tabIndexLocal !== null ? Number(tabIndexLocal) : 0);
  }, [tabIndex, user]);

  return !isLoaded ? (
    <div className="flex items-center justify-center">
      <span className="loading loading-dots loading-lg"></span>
    </div>
  ) : (
    <>
      <h1 className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-4xl font-bold mx-auto">
        Hi, {user?.fullName}!{" "}
        {(user?.publicMetadata.isAdmin as boolean | undefined) && (
          <FaShieldAlt className="inline-block text-primary" />
        )}
        {(user?.publicMetadata.isVIP as boolean | undefined) && (
          <GiStarFormation className="inline-block text-secondary" />
        )}
      </h1>
      <div className="tabs tabs-boxed border-2 border-cyan-500 mb-4">
        <a
          className={
            tabIndex === 0 ? "tab no-underline tab-active" : "tab no-underline"
          }
          onClick={() => {
            setTabIndex(0);
            localStorage.setItem("dashboardTabIndex", "0");
          }}
        >
          Join a Room
        </a>
        <a
          className={
            tabIndex === 1 ? "tab no-underline tab-active" : "tab no-underline"
          }
          onClick={() => {
            setTabIndex(1);
            localStorage.setItem("dashboardTabIndex", "1");
          }}
        >
          Room List
        </a>
      </div>

      {tabIndex === 0 && (
        <>
          <input
            type="text"
            placeholder="Enter Room ID"
            className="input input-bordered input-primary mb-4"
            onChange={(event) => {
              console.log(event.target.value);
              setJoinRoomTextBox(event.target.value);
            }}
          />
          <Link
            href={joinRoomTextBox.length > 0 ? `/room/${joinRoomTextBox}` : "/"}
            className="btn btn-secondary"
          >
            Join Room
          </Link>
        </>
      )}

      {tabIndex === 1 && <RoomList />}
    </>
  );
};
