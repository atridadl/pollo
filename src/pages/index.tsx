import { type NextPage } from "next";
import Head from "next/head";

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
    </>
  );
};
