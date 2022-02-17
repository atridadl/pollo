import { User } from "firebase/auth";
interface FirebaseUser {
    user: User | null,
};

interface Poll {
    name: string,
    pollID: string,
    inProgress: boolean,
    ownerUID: string | undefined,
    questionIDs: string[]
};

interface StorePoll extends Poll {
    name: string,
    pollID: string,
    dbID: string,
    inProgress: boolean,
    ownerUID: string | undefined,
    questionIDs: string[]
};

export { FirebaseUser, Poll, StorePoll };