import { defineStore } from 'pinia';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { FirebaseUser } from '../types';

export const useAccountStore = defineStore('accounts', {
    // a function that returns a fresh state
    state: () => (<FirebaseUser>{
      user: null
    }),
    // optional getters
    getters: {
    },
    // optional actions
    actions: {
      async getAccount () {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            this.user = user;
            localStorage.setItem("uid", user.uid);
          } else {
            this.user = null;
            localStorage.removeItem("uid");
          }
        });
      },
      async signup (email: string, password: string, name: string) {
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // ...
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
          });
      },
      async login (email: string, password: string) {
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
          });
      },
      async logout () {
        signOut(auth).then(() => {
          this.user = null
        }).catch((error) => {
          // An error happened.
          console.log(error)
        })
      },
    },
  })