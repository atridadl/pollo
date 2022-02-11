<script lang="ts">
  import { onMount } from "svelte";
  import Router, { push, location } from "svelte-spa-router";
  import { wrap } from "svelte-spa-router/wrap";

  import { state } from "./store";
  import { sdk } from "./appwrite";

  import Alert from "./lib/Alert.svelte";
  import Login from "./routes/Login.svelte";
  import SignUp from "./routes/SignUp.svelte";
  import Polls from "./routes/Polls.svelte";
  import Home from "./routes/Home.svelte";

  const logout = async () => {
    try {
      await state.logout();
    } catch (error) {
      state.alert({ color: "red", message: error.message });
    } finally {
      state.init(null);
      push("/");
    }
  };

  const routes = {
    "/": Home,
    "/login": wrap({
      component: Login,
      conditions: [() => !$state.account],
    }),
    "/signup": SignUp,
    "/polls": wrap({
      component: Polls,
      conditions: [() => !!$state.account],
    }),
    "*": Home,
  };

  onMount(async () => {
    try {
      const account = await sdk.account.get();
      state.init(account);
    } catch (error) {
      state.init(null);
    }
  });
</script>

<Alert />
<Router {routes} on:conditionsFailed={() => push("/")} />
  
{#if $location !== "/login"}
  {#if $state.account}
  <section class="absolute top-0 right-0 py-3 px-6 mr-8 mb-8">
    <button
      on:click={logout}
      class="mx-auto mt-4 py-3 px-12 font-semibold text-md rounded-lg shadow-md bg-white text-gray-900 border border-gray-900 hover:border-transparent hover:text-white hover:bg-gray-900 focus:outline-none"
    >
      Logout 👋
    </button>
  </section>
  {:else}
  <section class="absolute top-0 right-0 py-3 px-6 mr-8 mb-8">
    <button
        on:click={() => push("/login")}
        class="mx-auto mt-4 py-3 px-12 font-semibold text-md rounded-lg shadow-md bg-white text-gray-900 border border-gray-900 hover:border-transparent hover:text-white hover:bg-gray-900 focus:outline-none"
    >
      Login 👋
    </button>
  </section>
  {/if}
{/if}
