import { Appwrite } from "appwrite";

const server = {
    endpoint: import.meta.env.VITE_APP_ENDPOINT?.toString(),
    project: import.meta.env.VITE_APP_PROJECT?.toString(),
    collection: import.meta.env.VITE_APP_COLLECTION_ID?.toString()
}

console.log(server)

const sdk = new Appwrite();

sdk.setEndpoint(server.endpoint || "").setProject(server.project || "");

export { sdk, server };