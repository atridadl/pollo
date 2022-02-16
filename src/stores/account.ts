import { defineStore, Store } from 'pinia';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";

interface StoreUser {
  user: User | null,
};

export const useAccountStore = defineStore('accounts', {
    // a function that returns a fresh state
    state: () => (<StoreUser>{
      user: null
    }),
    // optional getters
    getters: {
    },
    // optional actions
    actions: {
      async getAccount () {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
          console.log(user)
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
        const auth = getAuth();
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
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log(user)
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
          });
      },
      async logout () {
        const auth = getAuth();
        signOut(auth).then(() => {
          this.user = null
        }).catch((error) => {
          // An error happened.
          console.log(error)
        })
      },
    },
  })