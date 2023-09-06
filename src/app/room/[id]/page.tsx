import Loading from "@/app/_components/Loading";
import VoteUI from "@/app/_components/VoteUI";
import { Suspense } from "react";

export const runtime = "edge";
export const preferredRegion = ["pdx1"];

export default async function Room() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2">
      <Suspense fallback={<Loading />}>
        <VoteUI />
      </Suspense>
    </div>
  );
}
