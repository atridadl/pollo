import { type NextPage } from "next";
import Head from "next/head";
import { type GetServerSideProps } from "next";

import { getServerAuthSession } from "../../server/auth";
import { api } from "~/utils/api";
import { IoTrashBinOutline } from "react-icons/io5";
import { AiOutlineClear } from "react-icons/ai";
import { FaShieldAlt } from "react-icons/fa";
import type { Role } from "~/utils/types";

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

  if (session.user.role !== "ADMIN") {
    ctx.res.statusCode = 403;
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  // Return session if logged in
  return {
    props: { session },
  };
};

const Admin: NextPage = () => {
  return (
    <>
      <Head>
        <title>Sprint Padawan - Admin</title>
        <meta name="description" content="Plan. Sprint. Repeat." />
      </Head>
      <div className="flex flex-col items-center justify-center text-center px-4 py-16 ">
        <div className="flex flex-col items-center">
          <AdminBody />
        </div>
      </div>
    </>
  );
};

export default Admin;

const AdminBody: React.FC = () => {
  const {
    data: usersCount,
    isLoading: usersCountLoading,
    isFetching: usersCountFetching,
    refetch: refetchUsersCount,
  } = api.user.countAll.useQuery();
  const {
    data: users,
    isLoading: usersLoading,
    isFetching: usersFetching,
    refetch: refetchUsers,
  } = api.user.getAll.useQuery();
  const {
    data: roomsCount,
    isLoading: roomsCountLoading,
    isFetching: roomsCountFetching,
    refetch: refetchRoomsCount,
  } = api.room.countAll.useQuery();
  const {
    data: votesCount,
    isLoading: votesCountLoading,
    isFetching: votesCountFetching,
    refetch: refetchVotesCount,
  } = api.vote.countAll.useQuery();

  const deleteUserMutation = api.user.delete.useMutation({
    onSuccess: async () => {
      await refetchData();
    },
  });

  const clearSessionsMutation = api.session.deleteAll.useMutation({
    onSuccess: async () => {
      await refetchData();
    },
  });

  const setRoleMutation = api.user.setRole.useMutation({
    onSuccess: async () => {
      await refetchData();
    },
  });

  const deleteUserHandler = async (userId: string) => {
    await deleteUserMutation.mutateAsync({ userId });
  };

  const clearSessionsHandler = async (userId: string) => {
    await clearSessionsMutation.mutateAsync({ userId });
  };

  const setUserRoleHandler = async (userId: string, role: Role) => {
    await setRoleMutation.mutateAsync({ userId, role });
  };

  const refetchData = async () => {
    await Promise.all([
      refetchUsers(),
      refetchUsersCount(),
      refetchRoomsCount(),
      refetchVotesCount(),
    ]);
  };

  return (
    <>
      <h1 className="text-4xl font-bold">Admin Panel</h1>

      <div className="stats stats-horizontal shadow bg-neutral m-4">
        <div className="stat">
          <div className="stat-title">Users</div>
          <div className="stat-value">
            {usersCountLoading || usersCountFetching ? (
              <span className="loading loading-spinner loading-lg"></span>
            ) : (
              <>{usersCount ? usersCount : "0"}</>
            )}
          </div>
        </div>

        <div className="stat">
          <div className="stat-title">Rooms</div>
          <div className="stat-value">
            {roomsCountLoading || roomsCountFetching ? (
              <span className="loading loading-spinner loading-lg"></span>
            ) : (
              <>{roomsCount ? roomsCount : "0"}</>
            )}
          </div>
        </div>

        <div className="stat">
          <div className="stat-title">Votes</div>
          <div className="stat-value">
            {votesCountLoading || votesCountFetching ? (
              <span className="loading loading-spinner loading-lg"></span>
            ) : (
              <>{votesCount ? votesCount : "0"}</>
            )}
          </div>
        </div>
      </div>

      {usersCountFetching ||
      usersFetching ||
      roomsCountFetching ||
      votesCountFetching ? (
        <button className="btn btn-primary loading">Fetching...</button>
      ) : (
        <button className="btn btn-primary" onClick={() => void refetchData()}>
          Re-fetch
        </button>
      )}

      <div className="card max-w-[80vw] bg-neutral shadow-xl m-4">
        <div className="card-body">
          <h2 className="card-title">Users:</h2>

          {usersLoading || usersFetching ? (
            <span className="loading loading-spinner loading-lg"></span>
          ) : (
            <div className="overflow-x-scroll">
              <table className="table text-center">
                {/* head */}
                <thead>
                  <tr className="border-white">
                    <th>ID</th>
                    <th>Name</th>
                    <th>Created At</th>
                    <th># Sessions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="">
                  {users
                    ?.sort((user1, user2) =>
                      user2.createdAt > user1.createdAt ? 1 : -1
                    )
                    .map((user) => {
                      return (
                        <tr key={user.id} className="hover">
                          <td className="max-w-[100px] break-words">
                            {user.id}
                          </td>

                          <td className="max-w-[100px] break-normal">
                            {user.name}
                          </td>
                          <td className="max-w-[100px] break-normal">
                            {user.createdAt.toLocaleDateString()}
                          </td>
                          <td className="max-w-[100px] break-normal">
                            {user.sessions.length}
                          </td>
                          <td>
                            <button className="m-2">
                              {user.role === "ADMIN" ? (
                                <FaShieldAlt
                                  className="text-xl inline-block text-primary"
                                  onClick={() =>
                                    void setUserRoleHandler(user.id, "USER")
                                  }
                                />
                              ) : (
                                <FaShieldAlt
                                  className="text-xl inline-block"
                                  onClick={() =>
                                    void setUserRoleHandler(user.id, "ADMIN")
                                  }
                                />
                              )}
                            </button>
                            <button
                              className="m-2"
                              onClick={() => void clearSessionsHandler(user.id)}
                            >
                              <AiOutlineClear className="text-xl inline-block hover:text-warning" />
                            </button>
                            <button
                              className="m-2"
                              onClick={() => void deleteUserHandler(user.id)}
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
        </div>
      </div>
    </>
  );
};
