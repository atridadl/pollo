import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { AblyTokenResponse } from "~/services/types";

// Get Room List
export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const { userId } = await getAuth({ context, params, request });

  if (!userId) {
    return json("Not Signed In!", {
      status: 403,
      statusText: "UNAUTHORIZED!",
    });
  }

  if (!process.env.ABLY_API_KEY) {
    return new Response(
      `Missing ABLY_API_KEY environment variable.
                If you're running locally, please ensure you have a ./.env file with a value for ABLY_API_KEY=your-key.
                If you're running in Netlify, make sure you've configured env variable ABLY_API_KEY. 
                Please see README.md for more details on configuring your Ably API Key.`,
      {
        status: 500,
        statusText: `Missing ABLY_API_KEY environment variable.
        If you're running locally, please ensure you have a ./.env file with a value for ABLY_API_KEY=your-key.
        If you're running in Netlify, make sure you've configured env variable ABLY_API_KEY. 
        Please see README.md for more details on configuring your Ably API Key.`,
      }
    );
  }

  const keyName = process.env.ABLY_API_KEY!.split(":")[0];

  const tokenResponse = await fetch(
    `https://rest.ably.io/keys/${keyName}/requestToken`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(process.env.ABLY_API_KEY!)}`,
      },
      body: JSON.stringify({
        keyName,
        clientId: userId,
        timestamp: Date.now(),
      }),
    }
  );
  const tokenResponseData = (await tokenResponse.json()) as AblyTokenResponse;

  return json(tokenResponseData, {
    status: 200,
    statusText: "SUCCESS",
  });
}
