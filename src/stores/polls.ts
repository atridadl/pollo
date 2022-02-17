import { defineStore, Store } from 'pinia';
import { doc, query, where, addDoc, deleteDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from '../firebase';
import { Poll, StorePoll } from '../types';

export const usePollStore = defineStore('polls', {
    // a function that returns a fresh state
    state: () => ({
      polls: [] as StorePoll[],
    }),
    // optional getters
    getters: {
    },
    // optional actions
    actions: {
      async getPolls () {
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
      async addPoll (poll: Poll) {
        await addDoc(collection(db, "polls"), poll);
      },
      async editPoll (pollID: string) {
      },
      async deletePoll (dbID: string) {
        await deleteDoc(doc(db, "polls", dbID));
      },
      async togglePollStatus (pollID: string) {
      },
    },
  })