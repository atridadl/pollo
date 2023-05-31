import { type NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import { type GetServerSideProps } from "next";

import { getServerAuthSession } from "../../server/auth";
import { api } from "~/utils/api";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loading from "~/components/Loading";
import { FaGithub, FaGoogle } from "react-icons/fa";

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

const Profile: NextPage = () => {
  return (
    <>
      <Head>
        <title>Sprint Padawan - Profile</title>
        <meta name="description" content="Plan. Sprint. Repeat." />
      </Head>
      <div className="flex flex-col items-center justify-center text-center gap-12 px-4 py-16 ">
        <div className="flex flex-col items-center prose">
          <ProfileBody />
        </div>
      </div>
    </>
  );
};

export default Profile;

const ProfileBody: React.FC = () => {
  const { data: sessionData } = useSession();
  const [nameText, setNameText] = useState<string>("");
  const router = useRouter();

  const { data: providers, isLoading: providersLoading } =
    api.user.getProviders.useQuery();

  const deleteUserMutation = api.user.delete.useMutation({});
  const saveUserMutation = api.user.save.useMutation({});

  const deleteCurrentUser = async () => {
    await deleteUserMutation.mutateAsync();
    (document.querySelector("#delete-user-modal") as HTMLInputElement).checked =
      false;
    router.reload();
  };

  const saveUser = async () => {
    await saveUserMutation.mutateAsync({
      name: nameText,
    });
    router.reload();
  };

  useEffect(() => {
    setNameText(sessionData?.user.name || "");
  }, [sessionData]);

  if (sessionData) {
    return (
      <>
        <input
          type="checkbox"
          id="delete-user-modal"
          className="modal-toggle"
        />
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box flex-col flex text-center justify-center items-center">
            <label
              htmlFor="delete-user-modal"
              className="btn btn-sm btn-circle absolute right-2 top-2"
            >
              ✕
            </label>

            <h3 className="font-bold text-lg text-error">
              This action will delete ALL data associated with your account. The
              same GitHub Account can be used, but none of your existing data
              will be available. If you are sure, please confirm below:
            </h3>

            <div className="modal-action">
              <label
                htmlFor="delete-user-modal"
                className="btn btn-error"
                onClick={() => void deleteCurrentUser()}
              >
                I am sure!
              </label>
            </div>
          </div>
        </div>

        <div className="card w-90 bg-neutral shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Profile:</h2>
            {sessionData.user.image && (
              <Image
                className="mx-auto"
                src={sessionData.user.image}
                alt="Profile picture."
                height={100}
                width={100}
                priority
              />
            )}

            {providersLoading ? (
              <div className="mx-auto">
                <Loading />
              </div>
            ) : (
              <div className="mx-auto">
                <button
                  className={`btn btn-square btn-outline mx-2`}
                  disabled={providers?.includes("github")}
                  onClick={() => void signIn("github")}
                >
                  <FaGithub />
                </button>

                <button
                  className={`btn btn-square btn-outline mx-2`}
                  disabled={providers?.includes("google")}
                  onClick={() => void signIn("google")}
                >
                  <FaGoogle />
                </button>
              </div>
            )}

            {sessionData.user.name && (
              <input
                type="text"
                placeholder="Name"
                className="input input-bordered"
                value={nameText}
                onChange={(event) => setNameText(event.target.value)}
              />
            )}

            {sessionData.user.email && (
              <input
                type="text"
                placeholder="Email"
                className="input input-bordered"
                value={sessionData.user.email}
                disabled
              />
            )}

            <button
              onClick={() => void saveUser()}
              className="btn btn-secondary"
            >
              Save Account
            </button>

            {/* <button className="btn btn-error">Delete Account</button> */}

            <label htmlFor="delete-user-modal" className="btn btn-error">
              Delete Account
            </label>
          </div>
        </div>
      </>
    );
  } else {
    return <h1>Error getting login session!</h1>;
  }
};
