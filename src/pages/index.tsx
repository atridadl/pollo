import { type NextPage } from "next";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";

import RoomList from "~/components/RoomList";

import { useState } from "react";
import Link from "next/link";
import Loading from "~/components/Loading";
import { FaShieldAlt } from "react-icons/fa";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Sprint Padawan</title>
        <meta name="description" content="Plan. Sprint. Repeat." />
      </Head>
      <div className="prose flex flex-col text-center items-center justify-center px-4 py-16">
        <HomePageBody />
      </div>
    </>
  );
};

export default Home;

const HomePageBody: React.FC = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const [joinRoomTextBox, setJoinRoomTextBox] = useState<string>("");
  const [tabIndex, setTabIndex] = useState<number>(0);

  if (sessionStatus === "authenticated") {
    return (
      <>
        <h1 className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-md mx-auto">
          Hi, {sessionData.user.name}!{" "}
          {sessionData.user.role === "ADMIN" && (
            <FaShieldAlt className="inline-block text-primary" />
          )}
        </h1>
        <div className="tabs tabs-boxed border-2 border-cyan-500 mb-4">
          <a
            className={
              tabIndex === 0
                ? "tab no-underline tab-active"
                : "tab no-underline"
            }
            onClick={() => setTabIndex(0)}
          >
            Join a Room
          </a>
          <a
            className={
              tabIndex === 1
                ? "tab no-underline tab-active"
                : "tab no-underline"
            }
            onClick={() => setTabIndex(1)}
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
              href={
                joinRoomTextBox.length > 0 ? `/room/${joinRoomTextBox}` : "/"
              }
              className="btn btn-secondary"
            >
              Join Room
            </Link>
          </>
        )}

        {tabIndex === 1 && <RoomList />}
      </>
    );
  } else {
    return (
      <>
        <h1 className="text-6xl">
          Sprint{" "}
          <span className="bg-gradient-to-br from-pink-600 to-cyan-400 bg-clip-text text-transparent box-decoration-clone">
            Padawan
          </span>
        </h1>

        <h2 className="my-4 text-3xl">
          A{" "}
          <span className="bg-gradient-to-br from-pink-600 to-pink-400 bg-clip-text text-transparent box-decoration-clone">
            scrum poker{" "}
          </span>{" "}
          tool that helps{" "}
          <span className="bg-gradient-to-br from-purple-600 to-purple-400 bg-clip-text text-transparent box-decoration-clone">
            agile teams{" "}
          </span>{" "}
          plan their sprints in{" "}
          <span className="bg-gradient-to-br from-cyan-600 to-cyan-400 bg-clip-text text-transparent box-decoration-clone">
            real-time
          </span>
          .
        </h2>

        {sessionStatus === "loading" ? (
          <Loading />
        ) : (
          <button className="btn btn-secondary" onClick={() => void signIn()}>
            Sign In
          </button>
        )}
      </>
    );
  }
};
