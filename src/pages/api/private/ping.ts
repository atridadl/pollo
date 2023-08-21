import { NextResponse } from "next/server";

export const config = {
  runtime: "edge",
  regions: ["pdx1"],
};

export default function handler() {
  return NextResponse.json(
    { message: "Private Pong!" },
    { status: 200, statusText: "SUCCESS" }
  );
}