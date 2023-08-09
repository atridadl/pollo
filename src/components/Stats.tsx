import { configureAbly, useChannel } from "@ably-labs/react-hooks";
import { env } from "~/env.mjs";
import { api } from "~/utils/api";

const Stats = () => {
  configureAbly({
    key: env.NEXT_PUBLIC_ABLY_PUBLIC_KEY,
    recover: (_, cb) => {
      cb(true);
    },
  });

  const [] = useChannel(
    `${env.NEXT_PUBLIC_APP_ENV}-stats`,
    () => void refetchData()
  );

  const {
    data: usersCount,
    isLoading: usersCountLoading,
    isFetching: usersCountFetching,
    refetch: refetchUsersCount,
  } = api.rest.userCount.useQuery();
  const {
    data: roomsCount,
    isLoading: roomsCountLoading,
    isFetching: roomsCountFetching,
    refetch: refetchRoomsCount,
  } = api.rest.roomCount.useQuery();
  const {
    data: votesCount,
    isLoading: votesCountLoading,
    isFetching: votesCountFetching,
    refetch: refetchVotesCount,
  } = api.rest.voteCount.useQuery();

  const refetchData = async () => {
    await Promise.all([
      refetchUsersCount(),
      refetchRoomsCount(),
      refetchVotesCount(),
    ]);
  };

  return (
    <div className="stats stats-horizontal shadow bg-neutral m-4">
      <div className="stat">
        <div className="stat-title">Users</div>
        <div className="stat-value">
          {usersCountLoading || usersCountFetching ? (
            <span className="loading loading-dots loading-lg"></span>
          ) : (
            <>{usersCount ? usersCount : "0"}</>
          )}
        </div>
      </div>

      <div className="stat">
        <div className="stat-title">Rooms</div>
        <div className="stat-value">
          {roomsCountLoading || roomsCountFetching ? (
            <span className="loading loading-dots loading-lg"></span>
          ) : (
            <>{roomsCount ? roomsCount : "0"}</>
          )}
        </div>
      </div>

      <div className="stat">
        <div className="stat-title">Votes</div>
        <div className="stat-value">
          {votesCountLoading || votesCountFetching ? (
            <span className="loading loading-dots loading-lg"></span>
          ) : (
            <>{votesCount ? votesCount : "0"}</>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;
