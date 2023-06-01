import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";

import RoomList from "~/components/RoomList";

import { useState } from "react";
import Link from "next/link";
import { FaShieldAlt } from "react-icons/fa";
import { getServerAuthSession } from "~/server/auth";

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
  const { data: sessionData } = useSession();
  const [joinRoomTextBox, setJoinRoomTextBox] = useState<string>("");
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <>
      <h1 className="flex flex-row flex-wrap text-center justify-center items-center gap-1 text-md mx-auto">
        Hi, {sessionData?.user.name}!{" "}
        {sessionData?.user.role === "ADMIN" && (
          <FaShieldAlt className="inline-block text-primary" />
        )}
      </h1>
      <div className="tabs tabs-boxed border-2 border-cyan-500 mb-4">
        <a
          className={
            tabIndex === 0 ? "tab no-underline tab-active" : "tab no-underline"
          }
          onClick={() => setTabIndex(0)}
        >
          Join a Room
        </a>
        <a
          className={
            tabIndex === 1 ? "tab no-underline tab-active" : "tab no-underline"
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
