import { User } from "firebase/auth";

enum QuestionType {
    MultiChoice = 0,
    TrueFalse = 1,
};

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

interface Choice {
    content: string,
};

interface Question {
    questionID: string,
    ownerUID: string | undefined,
    title: string,
    questionType: QuestionType,
    choices: Choice[] | undefined,
    correctChoice: number | undefined
};

interface StoreQuestion {
    questionID: string,
    dbID: string,
    ownerUID: string | undefined,
    title: string,
    questionType: QuestionType,
    choices: Choice[] | undefined,
    correctChoice: number | undefined
};

export { FirebaseUser, Poll, StorePoll, Choice, Question, StoreQuestion, QuestionType };