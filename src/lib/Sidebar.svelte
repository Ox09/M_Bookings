<script lang="ts">
  import logo from "../assets/logo.svg";

  const links: Link[] = [
    {
      logo: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="m368-320 112-84 110 84-42-136 112-88H524l-44-136-44 136H300l110 88-42 136ZM160-160q-33 0-56.5-23.5T80-240v-135q0-11 7-19t18-10q24-8 39.5-29t15.5-47q0-26-15.5-47T105-556q-11-2-18-10t-7-19v-135q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v135q0 11-7 19t-18 10q-24 8-39.5 29T800-480q0 26 15.5 47t39.5 29q11 2 18 10t7 19v135q0 33-23.5 56.5T800-160H160Z"/></svg>`,
      title: "Bookings",
      link: "bookings",
    },
    {
      logo: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm80 240v-80h400v80H280Zm0 160v-80h280v80H280Z"/></svg>`,
      title: "Calendar",
      link: "calendar",
    },
  ];

  interface Props {
    activeRoute?: Link;
  }
  interface Link {
    logo: string;
    title: string;
    link: string;
  }

  let { activeRoute = $bindable() }: Props = $props();
  let activeLink: Link = $state(links[0]);

  $effect(() => {
    activeRoute = links[0];
  });

  const handleActiveLink = (e: Event, link: Link) => {
    e.preventDefault();
    activeLink = link;
    activeRoute = link;
  };
</script>

<nav>
  <div class="logo-wrapper">
    <img src={logo} alt="app-logo" class="app-logo" />
    <p class="app-title">M Bookings</p>
  </div>

  <div class="body">
    {#each links as link}
      <a
        href={link.link}
        class="link"
        class:active={activeLink.title === link.title}
        onclick={(e: Event) => handleActiveLink(e, link)}
      >
        <div class="link-logo">{@html link.logo}</div>
        <div class="link-title">{link.title}</div>
      </a>
    {/each}
  </div>
</nav>

<style>
  nav {
    width: 200px;
    background-color: #f8f9fa;
    padding: 20px;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    overflow-y: auto;
  }

  .logo-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 25px;
  }

  .app-logo {
    width: 39px;
  }

  .app-title {
    color: #909397;
    font-size: 21px;
  }

  .link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px;
    color: #909397;
    text-decoration: none;
    font-size: 17px;
    transition: background-color 0.2s ease;
    border-radius: 5px;
    margin-bottom: 5px;
  }

  .link-logo {
    fill: #909397;
    vertical-align: middle;
  }

  .link:hover {
    background-color: #f4f4f4;
    cursor: pointer;
  }

  .link.active {
    background-color: #ebe7e7;
    color: #172838;
  }
  .link.active .link-logo {
    fill: #172838;
  }

  /* Responsive adjustments */
  @media (max-width: 900px) {
    nav {
      width: 100%;
      height: auto;
      position: fixed;
      bottom: 0;
      left: 0;
      flex-direction: row;
      gap: 10px;
      box-shadow: none;
      padding: 10px;
      z-index: 1;
    }

    .logo-wrapper {
      border-right: 3px solid #909397;
      padding-right: 10px;
    }

    .link-logo {
      display: none;
    }

    .app-title {
      line-height: 0;
    }

    .link {
      flex-direction: column;
      justify-content: center;
      margin-bottom: 0;
    }
    .body {
      display: flex;
    }

    .logo-wrapper {
      margin-bottom: 0px;
    }
  }
  @media (max-width: 400px) {
    nav {
      padding: 3px;
      z-index: 1;
    }

    .logo-wrapper {
      border-right: 3px solid #909397;
      padding-right: 10px;
    }

    .link-logo {
      display: none;
    }

    .app-title {
      line-height: 0;
      font-size: 14px;
    }

    .link {
      font-size: 14px;
    }
    .body {
      display: flex;
    }

    .logo-wrapper {
      margin-bottom: 0px;
    }
  }
</style>
