/* eslint-disable */
import { env } from "~/env.mjs";

const hostname = env.JMAP_HOSTNAME || "api.fastmail.com";
const username = env.JMAP_USERNAME;

const authUrl = `https://${hostname}/.well-known/jmap`;
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${env.JMAP_TOKEN}`,
};

export const getSession = async () => {
  const response = await fetch(authUrl, {
    method: "GET",
    headers,
  });
  return response.json();
};

export const mailboxQuery = async (apiUrl: string, accountId: string) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [
        ["Mailbox/query", { accountId, filter: { name: "Drafts" } }, "a"],
      ],
    }),
  });
  const data = await response.json();

  return await data["methodResponses"][0][1].ids[0];
};

export const identityQuery = async (apiUrl: string, accountId: string) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
        "urn:ietf:params:jmap:submission",
      ],
      methodCalls: [["Identity/get", { accountId, ids: null }, "a"]],
    }),
  });
  const data = await response.json();

  return await data["methodResponses"][0][1].list.filter(
    // eslint-disable-line
    (identity: any) => identity.email === username
  )[0].id;
};

export const draftResponse = async (
  apiUrl: string,
  accountId: string,
  draftId: string,
  identityId: string,
  subject: string,
  messageBody: string,
  sendTo: string
) => {
  const draftObject = {
    from: [{ email: username }],
    to: [{ email: sendTo }],
    subject,
    keywords: { $draft: true },
    mailboxIds: { [draftId]: true },
    bodyValues: { body: { value: messageBody, charset: "utf-8" } },
    textBody: [{ partId: "body", type: "text/plain" }],
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
        "urn:ietf:params:jmap:submission",
      ],
      methodCalls: [
        ["Email/set", { accountId, create: { draft: draftObject } }, "a"],
        [
          "EmailSubmission/set",
          {
            accountId,
            onSuccessDestroyEmail: ["#sendIt"],
            create: { sendIt: { emailId: "#draft", identityId } },
          },
          "b",
        ],
      ],
    }),
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
};

export const sendMail = async (
  subject: string,
  body: string,
  sendTo: string
) => {
  const session = await getSession();
  const apiUrl = session.apiUrl;
  const accountId = session.primaryAccounts["urn:ietf:params:jmap:mail"];

  const draftId = await mailboxQuery(apiUrl, accountId);

  const identityId = await identityQuery(apiUrl, accountId);
  draftResponse(apiUrl, accountId, draftId, identityId, subject, body, sendTo);
};
