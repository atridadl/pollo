<script lang="ts">
  import { onMount } from "svelte";

  import { state, todos } from "../store";

  let value = "";

  onMount(todos.fetch);
</script>

<section
  class="container h-screen max-h-screen px-3 max-w-xl mx-auto flex flex-col"
>
  <div class="my-auto p-16 rounded-lg text-center">
    <div class="font-bold text-3xl md:text-5xl lg:text-6xl">
      Pollo
    </div>

    <div class="font-bold text-lg md:text-xl lg:text-2xl">
      Polling. Simplified.
    </div>

    <form on:submit|preventDefault={() => {console.log(`Joined ${value}`)}}>
      <input
        type="text"
        class="w-full my-8 px-4 py-2 text-center text-md rounded-lg border-1 focus:ring-2 focus:ring-gray-800 transition duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110 hover:shadow-xl shadow-lg"
        placeholder="Enter your ✨poll code✨!"
        bind:value
      />
    </form>
  </div>
</section>
