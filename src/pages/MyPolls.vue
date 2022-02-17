<script setup lang="ts">
import { ref, onMounted } from "vue";
import { usePollStore } from '../stores/polls'
import { useAccountStore } from '../stores/account'
import PollItem from '../components/PollItem.vue'
import { makeID } from '../helpers';

const pollStore = usePollStore();
const accountStore = useAccountStore();
const newPollModal = ref(false);
const pollName = ref("");


function setNewPollModal (state: boolean) {
    newPollModal.value = state;
}

async function addPoll () {
    pollStore.addPoll({
        name: pollName.value,
        pollID: makeID(5),
        inProgress: false,
        ownerUID: accountStore.user?.uid,
        questionIDs: []
    })
    setNewPollModal(false);
    pollName.value = "";
};

onMounted(() => {
    pollStore.getPolls();
});
</script>

<template>
    <section
        class="container h-screen max-h-screen px-3 max-w-xl mx-auto flex flex-col"
    >
        <div class="my-auto p-16 rounded-lg text-center">
            <div class="font-bold text-3xl md:text-5xl lg:text-6xl">
                Your Polls:
            </div>

            <button
                v-on:click="setNewPollModal(true)"
                class="mx-auto mt-4 py-2 px-4 font-semibold text-md rounded-lg shadow-md bg-white text-gray-900 border border-gray-900 hover:border-transparent hover:text-white hover:bg-gray-900 focus:outline-none"
            >
                🚀 New Poll
            </button>

            <div v-if="newPollModal" class="z-40 bg-slate-800 bg-opacity-50 flex justify-center items-center absolute top-0 right-0 bottom-0 left-0">
                <div class="bg-white px-16 py-14 rounded-md text-center">
                    <form>
                        <label class="block mt-6" for="name">Poll Name</label>
                        <input
                            id="name"
                            class="w-full p-4 placeholder-gray-400 text-gray-700 bg-white text-lg border-0 border-b-2 border-gray-400 focus:ring-0 focus:border-gray-900"
                            v-model="pollName"
                        />
                    </form>
                    <button
                        v-on:click="setNewPollModal(false)"
                        class="mx-2 mt-4 py-2 px-4 font-semibold text-md rounded-lg bg-white text-gray-900 border border-gray-900 hover:border-4 hover:border-red-500 hover:text-white hover:bg-gray-900 focus:outline-none"
                    >
                        ❌ Cancel
                    </button>
                    <button
                        v-on:click="addPoll()"
                        class="mx-2 mt-4 py-2 px-4 font-semibold text-md rounded-lg bg-white text-gray-900 border border-gray-900 hover:border-4 hover:border-green-500 hover:text-white hover:bg-gray-900 focus:outline-none"
                    >
                        🚀 Submit
                    </button>
                </div>
            </div>

            <ul>
                <PollItem v-for="poll in pollStore.polls" :key="poll.dbID" :poll="poll" />
            </ul>
        </div>
    </section>
</template>