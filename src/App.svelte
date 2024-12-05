<script lang="ts">
  import "./app.css";
  import Sidebar from "./lib/Sidebar.svelte";
  import Bookings from "./pages/Bookings.svelte";
  import Calender from "./lib/Calender.svelte";
  import { fade, slide } from "svelte/transition";

  interface Link {
    logo: string;
    title: string;
    link: string;
  }

  let activeRoute: Link | undefined = $state();
</script>

<main>
  <section>
    <Sidebar bind:activeRoute />
    {#if activeRoute?.title === "Bookings"}
      <Bookings transition={slide} />
    {:else if activeRoute?.title === "Calendar"}
      <Calender transition={slide} />
    {/if}

    <!-- Owner -->
    <a
      href="https://github.com/Ox09/M_Bookings.git"
      class="group fixed left-5 bottom-2"
      >Made by
      <span
        class="group-hover:border-b-pink-500 group-hover:text-pink-500 font-bold"
        >Ox09</span
      >
    </a>
  </section>
</main>

<style>
  a{
    position: fixed;
    left: 20px;
    bottom: 20px;
    text-decoration: none;
    color: darkgray;

    &:hover{
      span{
        border-bottom: 1px solid cadetblue;
        color:  cadetblue;
      }
    }
  }
</style>