<script setup lang="ts">
import { onMounted } from 'vue';
import { usePollStore } from '../stores/polls'
const props = defineProps(['name', 'pollID', 'dbID'])

const pollStore = usePollStore();

function deletePoll () {
    pollStore.deletePoll(props.dbID);
}

onMounted(() => {
    console.log(props);
});
</script>

<template>
    <li class="flex justify-between items-center mt-4">
        <div class="flex">
            <div
                class="capitalize ml-3 text-md font-medium"
                class:line-through={todo.isComplete}
            >
                [{{ props.pollID }}] {{ props.name }}
            </div>
        </div>
        <button
            v-on:click="deletePoll()"
            class="focus:outline-none transition duration-75 ease-in-out transform hover:scale-125"
        >
            ❌
        </button>
    </li>
</template>