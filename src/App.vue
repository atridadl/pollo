<script setup lang="ts">
import { onMounted } from "vue";
import { useAccountStore } from './stores/account'
const accountStore = useAccountStore();

async function attemptLogin () {
  await accountStore.login("","");
  console.log(accountStore.account);
}

async function attemptLogout () {
  await accountStore.logout();
}

onMounted(() => {
  accountStore.getAccount();
})
</script>

<template>
  <router-view />
   <section v-if="accountStore.account.$id" class="absolute top-0 right-0 py-3 px-6 mr-2 mt-2">
      <button
        v-on:click="attemptLogout"
        class="logout-button mx-auto mt-4 py-2 px-4 font-semibold text-md rounded-lg shadow-md bg-white text-gray-900 border border-gray-900 hover:border-transparent hover:text-white hover:bg-gray-900 focus:outline-none"
      >
      <span>
          👋 Hi {{ accountStore.account.name }}!
      </span>
      </button>
  </section>
  <section v-else class="absolute top-0 right-0 py-3 px-6 mr-2 mt-2">
      <button
        v-on:click="attemptLogin"
        class="mx-auto mt-4 py-2 px-4 font-semibold text-md rounded-lg shadow-md bg-white text-gray-900 border border-gray-900 hover:border-transparent hover:text-white hover:bg-gray-900 focus:outline-none"
      >
      ✨ Login ✨
      </button>
  </section>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.logout-button:hover span {
  display: none;
}

.logout-button:hover:before {
  content:"😭 Logout?";
}
</style>
