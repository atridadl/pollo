import { defineStore } from 'pinia';
import { doc, query, where, addDoc, setDoc, deleteDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from '../plugins/firebase';
import { Poll, StorePoll } from '../utils/types';

export const useQuestionStore = defineStore('question', {
    // a function that returns a fresh state
    state: () => ({
      questions: [] as StorePoll[],
    }),
    // optional getters
    getters: {
    },
    // optional actions
    actions: {
      async get () {
      },
      async add (poll: Poll) {
      },
      async edit (poll: StorePoll) {
      },
      async delete (dbID: string) {
      },
    },
  })