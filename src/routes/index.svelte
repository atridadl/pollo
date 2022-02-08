<script>
    import { pokemon } from "../stores/main.js";
    console.log($pokemon);
</script>

<svelte:head>
    <title>Home</title>
</svelte:head>

<h1>Pollo</h1>

{#each $pokemon as pokeman}
<p>{pokeman.name}</p>
{/each}