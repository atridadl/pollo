import { defineStore } from 'pinia';
import { sdk, server } from '../appwrite'

export const useAccountStore = defineStore('accounts', {
    // a function that returns a fresh state
    state: () => ({
      account: {},
    }),
    // optional getters
    getters: {
    },
    // optional actions
    actions: {
      async getAccount () {
        try {
          const user = await sdk.account.get();
          this.account = user;
        } catch (error) {
          console.log(error);
        }
      },
      async signup (email: string, password: string, name: string) {
        try {
          const user = await sdk.account.create(email, password, name);
          this.account = user;
        } catch (error) {
          console.log(error);
        }
      },
      async login (email: string, password: string) {
        try {
          await sdk.account.createSession("person@site.com", "Fireice100");
          this.getAccount();
        } catch (error) {
          console.log(error);
        }
      },
      async logout () {
        try {
          await sdk.account.deleteSession("current");
          this.account = {};
        } catch (error) {
          console.log(error);
        }
      },
    },
  })