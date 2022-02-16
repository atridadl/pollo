<script setup lang="ts">
import { onMounted } from "vue";
import { useAccountStore } from './stores/account'
import { useRoute, useRouter } from 'vue-router'

const accountStore = useAccountStore();
const route = useRoute();
const router = useRouter();

function setViewHeight () {
  let vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

async function attemptLogout () {
  try {
      await accountStore.logout();
    } catch (error) {
      console.log()
    } finally {
      accountStore.getAccount();
      router.push("/");
    }
}

onMounted(() => {
  accountStore.getAccount();
  setViewHeight()
  window.addEventListener('resize', () => {
    setViewHeight()
  })
})
</script>

<template>
  <router-view />
  <section v-if="accountStore.user && route.path !== '/login' && route.path !== '/signup'" class="absolute top-0 right-0 py-3 px-6 mr-2 mt-2">
      <button
        v-on:click="attemptLogout"
        class="logout-button mx-auto mt-4 py-2 px-4 font-semibold text-md rounded-lg shadow-md bg-white text-gray-900 border border-gray-900 hover:border-transparent hover:text-white hover:bg-gray-900 focus:outline-none"
      >
      <span>
        👋 Hi {{ accountStore.user.email }}!
      </span>
      </button>
  </section>
  <section v-if="!accountStore.user && route.path !== '/login' && route.path !== '/signup'" class="absolute top-0 right-0 py-3 px-6 mr-2 mt-2">
      <button
        v-on:click="router.push('/login')"
        class="mx-auto mt-4 py-2 px-4 font-semibold text-md rounded-lg shadow-md bg-white text-gray-900 border border-gray-900 hover:border-transparent hover:text-white hover:bg-gray-900 focus:outline-none"
      >
        ✨ Login ✨
      </button>
  </section>
  <section v-if="route.path == '/login' || route.path == '/signup'" class="absolute top-0 right-0 py-3 px-6 mr-2 mt-2">
      <button
        v-on:click="router.push('/')"
        class="mx-auto mt-4 py-2 px-4 font-semibold text-md rounded-lg shadow-md bg-white text-gray-900 border border-gray-900 hover:border-transparent hover:text-white hover:bg-gray-900 focus:outline-none"
      >
        🏠 Home
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
}

.logout-button:hover span {
  display: none;
}

.logout-button:hover:before {
  content:"😭 Logout?";
}
</style>
