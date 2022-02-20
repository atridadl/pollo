import { defineStore } from 'pinia';
import { doc, query, where, addDoc, setDoc, deleteDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from '../plugins/firebase';
import { Question, StoreQuestion } from '../utils/types';

export const useQuestionStore = defineStore('question', {
    // a function that returns a fresh state
    state: () => ({
      questions: [] as StoreQuestion[],
    }),
    // optional getters
    getters: {
    },
    // optional actions
    actions: {
      async get () {
        const q = query(collection(db, "questions"), where("ownerUID", "==", `${localStorage.getItem("uid")}`));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const tempQuestions = [] as StoreQuestion[];
          querySnapshot.forEach((doc) => {
            doc.id
            tempQuestions.push({
              questionID: doc.data().questionID,
              ownerUID: doc.data().ownerUID,
              dbID: doc.id,
              title: doc.data().title,
              questionType: doc.data().questionType,
              choices: doc.data().choices,
              correctChoice: doc.data().correctChoice
            });
          });
          this.questions = tempQuestions;
          console.log(tempQuestions);
        });
      },
      async add (question: Question) {
      },
      async edit (question: StoreQuestion) {
      },
      async delete (dbID: string) {
      },
    },
  })