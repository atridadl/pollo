<script setup lang="ts">
import { ref } from 'vue';
import { usePollStore } from '../stores/poll'
const props = defineProps(['poll'])

const pollStore = usePollStore();
const editPollModal = ref(false);
const pollName = ref(props.poll.name);

function deletePoll () {
    pollStore.delete(props.poll.dbID);
}

function editPoll () {
    setEditPollModal(false);
    const newPoll = props.poll;
    newPoll.name = pollName;
    pollStore.edit(newPoll);
}
 function togglePollStatus () {
     pollStore.toggle(props.poll);
 }

function setEditPollModal (state: boolean) {
    editPollModal.value = state;
}
</script>

<template>
    <li class="flex justify-center items-center mt-4">
        <div class="flex">
            <div
                class="capitalize mr-10 text-md font-medium"
                class:line-through={todo.isComplete}
            >
                [{{ props.poll.pollID }}] {{ props.poll.name }}
            </div>
        </div>

        <button
            v-if="props.poll.inProgress"
            v-on:click="togglePollStatus()"
            class="mx-2 focus:outline-none transition duration-75 ease-in-out transform hover:scale-125"
        >
            ⏹
        </button>

        <button
            v-else
            v-on:click="togglePollStatus()"
            class="mx-2 focus:outline-none transition duration-75 ease-in-out transform hover:scale-125"
        >
            ▶️
        </button>

        <button
            v-on:click="setEditPollModal(true)"
            class="mx-2 focus:outline-none transition duration-75 ease-in-out transform hover:scale-125"
        >
            ✏️
        </button>

        <button
            v-on:click="deletePoll()"
            class="mx-2 focus:outline-none transition duration-75 ease-in-out transform hover:scale-125"
        >
            ❌
        </button>
    </li>

    <div v-if="editPollModal" class="z-40 bg-slate-800 bg-opacity-50 flex justify-center items-center absolute top-0 right-0 bottom-0 left-0">
        <div class="bg-white px-16 py-14 rounded-md text-center">
            <div class="font-bold text-lg md:text-xl lg:text-2xl">
                Editing [{{ props.poll.pollID }}] {{ props.poll.name }}
            </div>
            
            <form>
                <label class="block mt-6" for="name">Poll Name</label>
                <input
                    id="name"
                    class="w-full p-4 placeholder-gray-400 text-gray-700 bg-white text-lg border-0 border-b-2 border-gray-400 focus:ring-0 focus:border-gray-900"
                    v-model="pollName"
                />
            </form>
            <button
                v-on:click="setEditPollModal(false)"
                class="mx-2 mt-4 py-2 px-4 font-semibold text-md rounded-lg bg-white text-gray-900 border border-gray-900 hover:border-4 hover:border-red-500 hover:text-white hover:bg-gray-900 focus:outline-none"
            >
                ❌ Cancel
            </button>
            <button
                v-on:click="editPoll()"
                class="mx-2 mt-4 py-2 px-4 font-semibold text-md rounded-lg bg-white text-gray-900 border border-gray-900 hover:border-4 hover:border-green-500 hover:text-white hover:bg-gray-900 focus:outline-none"
            >
                🚀 Submit
            </button>
        </div>
    </div>
</template>