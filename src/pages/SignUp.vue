<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAccountStore } from '../stores/account'
import { useRouter } from 'vue-router';

const email = ref("");
const password = ref("");

const router = useRouter();
const accountStore = useAccountStore();

async function attemptSignUp () {
    await accountStore.signup(email.value, password.value);
    await accountStore.login(email.value, password.value);
    email.value = password.value = "";
    
};

const checkForm = computed(() => {
    return (email.value !== "" && password.value !== "");
});
</script>

<template>
    <section class="container h-screen mx-auto flex">
        <div class="flex-grow flex flex-col max-w-xl justify-center p-6">
            <h1 class="text-6xl font-bold">Sign Up</h1>
            <p class="mt-4">
                Already have an account ?
                <span class="cursor-pointer underline">
                    <a href="/login">Login </a>
                </span>
            </p>
            <form
                v-on:submit.prevent="attemptSignUp()"
            >
                <label class="block mt-6" for="email">Email</label>
                <input
                    id="email"
                    class="w-full p-4 placeholder-gray-400 text-gray-700 bg-white text-lg border-0 border-b-2 border-gray-400 focus:ring-0 focus:border-gray-900"
                    type="text"
                    v-model="email"
                />
                <label class="block mt-6" for="password">Password</label>
                <input
                    id="password"
                    class="w-full p-4 placeholder-gray-400 text-gray-700 bg-white text-lg border-0 border-b-2 border-gray-400 focus:ring-0 focus:border-gray-900"
                    type="password"
                    v-model="password"
                />

                <div class="mt-6">
                    <button
                        :disabled="!checkForm"
                        type="submit"
                        class="mx-auto mt-4 py-4 px-16 font-semibold rounded-lg shadow-md bg-gray-900 text-white border hover:border-gray-900 hover:text-gray-900 hover:bg-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sign Up
                    </button>
                </div>
            </form>
        </div>
    </section>
</template>