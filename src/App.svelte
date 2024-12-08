<script lang="ts">
  import "./app.css";
  import Sidebar from "./lib/Sidebar.svelte";
  import Bookings from "./pages/Bookings.svelte";
  import Calendar from "./pages/Calendar.svelte";

  let activeRoute = $state("Bookings");
</script>

<!-- Rendered page-->
{#snippet renderPage()}
  {#key activeRoute}
    {#if activeRoute === "Bookings"}
      <Bookings />
    {:else if activeRoute === "Calendar"}
      <Calendar />
    {/if}
  {/key}
{/snippet}

<main>
  <section>
    <Sidebar bind:activeRoute />
    {@render renderPage()}

    <!-- Owner -->
    <a href="https://github.com/Ox09/M_Bookings.git" class="link-to-github"
      >Made by
      <span class="">Ox09</span>
    </a>
  </section>
</main>
