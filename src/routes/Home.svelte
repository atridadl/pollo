<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";

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

    <form on:submit|preventDefault={() => {console.log(`Joined ${value}`)}}>
      <input
        type="text"
        class="w-full my-8 px-6 py-4 text-xl rounded-lg border-0 focus:ring-2 focus:ring-gray-800 transition duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110 hover:shadow-xl shadow-md"
        placeholder="🤔   What to do today?"
        bind:value
      />
    </form>
  </div>
</section>
