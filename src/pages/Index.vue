<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
    <section
        class="container h-screen max-h-screen px-3 max-w-xl mx-auto flex flex-col absolute inset-0"
    >
        <div class="my-auto p-2 rounded-lg text-center">
            <img class="w-2/5 my-8 mx-auto" src="/src/assets/logo.png" alt="">
            <div class="font-bold text-3xl md:text-5xl lg:text-6xl">
            Pollo
            </div>

            <div class="font-bold text-lg md:text-xl lg:text-2xl">
            Polling. Simplified.
            </div>

            <form>
            <input
                type="text"
                class="w-4/5 my-8 px-4 py-2 text-center text-md rounded-lg border-2 border-gray-400 hover:border-black transition duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110 hover:shadow-xl shadow-md"
                placeholder="Enter your ✨poll code✨!"
                bind:value
            />
            </form>
        </div>
    </section>
</template>