import { type NextPage } from "next";
import Head from "next/head";

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

const HomePageBody: React.FC = () => {
  return (
    <>
      <h1 className="text-6xl font-bold">
        Sprint{ " " }
        <span className="bg-gradient-to-br from-pink-600 to-cyan-400 bg-clip-text text-transparent box-decoration-clone">
          Padawan
        </span>
      </h1>

      <h2 className="my-4 text-3xl font-bold">
        A{ " " }
        <span className="bg-gradient-to-br from-pink-600 to-pink-400 bg-clip-text text-transparent box-decoration-clone">
          scrum poker{ " " }
        </span>{ " " }
        tool that helps{ " " }
        <span className="bg-gradient-to-br from-purple-600 to-purple-400 bg-clip-text text-transparent box-decoration-clone">
          agile teams{ " " }
        </span>{ " " }
        plan their sprints in{ " " }
        <span className="bg-gradient-to-br from-cyan-600 to-cyan-400 bg-clip-text text-transparent box-decoration-clone">
          real-time
        </span>
        .
      </h2>

      <div className="card bg-secondary text-black font-bold text-left">
        <div className="card-body">
          <h2 className="card-title">Features:</h2>
          <ul>
            <li>🚀 Real-time votes!</li>
            <li>🚀 Granular control of room name and vote scale!</li>
            <li>🚀 CSV Reports for every room!</li>
            <li>🚀 100% free and open-source... forever!</li>
          </ul>
        </div>
      </div>
    </>
  );
};
