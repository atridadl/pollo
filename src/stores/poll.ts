import { defineStore, Store } from 'pinia';
import { doc, query, where, addDoc, setDoc, deleteDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from '../plugins/firebase';
import { Poll, StorePoll } from '../utils/types';

export const usePollStore = defineStore('poll', {
    // a function that returns a fresh state
    state: () => ({
      polls: [] as StorePoll[],
    }),
    // optional getters
    getters: {
    },
    // optional actions
    actions: {
      async get () {
        const q = query(collection(db, "polls"), where("ownerUID", "==", `${localStorage.getItem("uid")}`));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const tempPolls = [] as StorePoll[];
          querySnapshot.forEach((doc) => {
            doc.id
            tempPolls.push({
              name: doc.data().name,
              pollID: doc.data().pollID,
              dbID: doc.id,
              inProgress: doc.data().inProgress,
              ownerUID: doc.data().ownerUID,
              questionIDs: doc.data().questionIDs
            });
          });
          this.polls = tempPolls;
        });
      },
      async add (poll: Poll) {
        await addDoc(collection(db, "polls"), poll);
      },
      async edit (poll: StorePoll) {
        await setDoc(doc(db, "polls", poll.dbID), {
          name: poll.name,
          pollID: poll.pollID,
          inProgress: poll.inProgress,
          ownerUID: poll.ownerUID,
          questionIDs: poll.questionIDs
        });
      },
      async delete (dbID: string) {
        await deleteDoc(doc(db, "polls", dbID));
      },
      async toggle (poll: StorePoll) {
        await setDoc(doc(db, "polls", poll.dbID), {
          name: poll.name,
          pollID: poll.pollID,
          inProgress: !poll.inProgress,
          ownerUID: poll.ownerUID,
          questionIDs: poll.questionIDs
        });
      },
    },
  })