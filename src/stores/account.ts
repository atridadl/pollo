import { defineStore } from 'pinia';
import { sdk, server } from '../appwrite';
import { User } from '../types';

export const useAccountStore = defineStore('accounts', {
    // a function that returns a fresh state
    state: () => (<User>{
      id: null,
      name: null,
      email: null,
    }),
    // optional getters
    getters: {
    },
    // optional actions
    actions: {
      async getAccount () {
        try {
          const user = await sdk.account.get();
          console.log(user)
          this.$patch({
            id: user.$id,
            name: user.name,
            email: user.email,
          });
          localStorage.setItem('id', user.$id);
        } catch (error) {
          console.log(error);
        }
      },
      async signup (email: string, password: string, name: string) {
        try {
          await sdk.account.create(email, password, name);
          this.getAccount()
        } catch (error) {
          console.log(error);
        }
      },
      async login (email: string, password: string) {
        try {
          await sdk.account.createSession(email, password);
          this.getAccount()
        } catch (error) {
          console.log(error);
        }
      },
      async logout () {
        try {
          await sdk.account.deleteSession("current");
          this.$patch({
            id: null,
            name: null,
            email: null,
          });
          localStorage.removeItem('id');
        } catch (error) {
          console.log(error);
        }
      },
    },
  })