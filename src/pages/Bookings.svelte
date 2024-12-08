<script lang="ts">
  import dayjs from "dayjs";
  import AddEvent from "../lib/AddEvent.svelte";
  import Tabs from "../lib/Tabs.svelte";
  import type { Events, OptionType } from "../utils/types";
  import { fade } from "svelte/transition";
  import { events } from "../store/store.svelte";
  import edit from "../assets/edit.svg";
  import add from "../assets/add.svg";
  import remove from "../assets/remove.svg";
  import { deleteSlide } from "../custom_trasnsitions-animations/custom_trasnsitions-animations";

  type ActiveTabInterface =
    | { viewType: "Upcoming"; eventsGroupedAs: "monthly"; color: "#006BFF" }
    | { viewType: "Pending"; eventsGroupedAs: "monthly"; color: "#5deb6f" }
    | { viewType: "New"; eventsGroupedAs: "monthly"; color: "#219B9D" }
    | { viewType: "Cancelled"; eventsGroupedAs: "monthly"; color: "#FF4545" };

  let activeTab: ActiveTabInterface = $state({
    viewType: "Upcoming",
    eventsGroupedAs: "monthly",
    color: "#006BFF",
  });
  let activeModal: string | null = $state(null);
  let tempEventHolder: Events | undefined = $state({
    id: String(Date.now()),
    task: "",
    description: "",
    date: dayjs().format("YYYY-MM-DD"),
    createdOn: [dayjs().format("YYYY-MM-DD"), dayjs().format("hh:mm A")],
    places: [],
    people: [],
    link: "",
    startTime: [dayjs().format("hh:mm"), dayjs().format("A")],
    endTime: ["", ""],
    eventType: {
      text: "Upcoming",
      color: "#006BFF",
    },
    background: "#D8EAFE",
  });

  const tabs = [
    { id: 0, title: "Upcoming" },
    { id: 1, title: "Pending" },
    { id: 2, title: "New" },
    { id: 3, title: "Cancelled" },
  ];
  const sortedTasks = $derived.by(() => {
    const sortedArray = events.reduce(
      (acc: Record<string, Record<string, Events[]>>, curr: Events) => {
        const month = dayjs(curr.date).format("MMMM");
        const type = curr.eventType;
        if (!acc[type.text]) {
          acc[type.text] = {};
        }
        if (!acc[type.text][month]) {
          acc[type.text][month] = [curr];
        } else {
          acc[type.text][month].unshift(curr);
        }
        return acc;
      },
      {}
    );
    return sortedArray;
  });

  function getCurrentTabValue(currentTab: string) {
    const validTabs = ["Upcoming", "Pending", "New", "Cancelled"] as const;

    if (validTabs.includes(currentTab as (typeof validTabs)[number])) {
      activeTab = {
        ...activeTab,
        viewType: currentTab,
      };
    }
  }

  function addNewEvent() {
    activeModal = "addEvent";
    tempEventHolder = {
      id: String(Date.now()),
      task: "",
      description: "",
      date: dayjs().format("YYYY-MM-DD"),
      createdOn: [dayjs().format("YYYY-MM-DD"), dayjs().format("hh:mm A")],
      places: [],
      people: [],
      link: "",
      startTime: [dayjs().format("hh:mm"), dayjs().format("A")],
      endTime: ["", ""],
      eventType: {
        text: activeTab.viewType,
        color: activeTab.color,
      } as OptionType,
      background: "#D8EAFE",
    };
  }
  function editEvent(event: Events) {
    activeModal = "updateEvent";
    tempEventHolder = event;
  }
  function deleteTask(id: string) {
    const findId = events.findIndex((item) => item.id === id);
    events.splice(findId, 1);
  }

</script>

{#snippet taskList(currentTab: string)}
  {@const types = Object.keys(sortedTasks)}
  {#each types as type}
    {#if type === currentTab}
      {@const months = Object.keys(sortedTasks[type])}
      <div in:fade={{ duration: 300 }}>
        {#each months as month}
          <div class="tab-content">
            <div class="month-group">
              <h3>{month}</h3>
              {#each sortedTasks[type][month] as task, index (task.id)}
                <div
                  class="task-item"
                  style={`background-color:${task.background}`}
                  out:deleteSlide={{ duration: 150 }}
                >
                  <div class="date-section">
                    <p class="day">
                      {dayjs(task.date || task.createdOn?.[0]).date()}
                    </p>
                    <p class="date">
                      {dayjs(task.date || task.createdOn?.[0]).format("ddd")}
                    </p>
                  </div>
                  <div class="details-section">
                    <div class="time">
                      <span
                        >{task.startTime.join(" ")} - {task.endTime.join(
                          " "
                        )}</span
                      >
                    </div>
                    <p class="task-title">{task.task}</p>
                    <p class="location">📍 {task.places.join(", ")}</p>
                    <p class="people">{task.people.join(", ")}</p>
                  </div>

                  {@render editTaskBtn(task)}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/each}
{/snippet}

<!-- Edit task -->
{#snippet editTaskBtn(taskDetails: Events)}
  <div
    class="edit-button"
    style={`background-color: ${taskDetails.background}`}
  >
    <button>Edit</button>
    <div class="edit-options">
      <button
        class="edit-option"
        type="button"
        onclick={() => editEvent(taskDetails)}
      >
        <img src={edit} alt="edit-task-icon" />
        Edit task
      </button>
      <button
        class="remove-option"
        type="button"
        onclick={() => deleteTask(taskDetails.id)}
      >
        <img src={remove} alt="cancel-task-icon" />
        Cancel task
      </button>
    </div>
  </div>
{/snippet}

<section class="bookings-page">
  <header>
    <h1>Bookings</h1>
    <p>See your scheduled events from your calendar events links.</p>
  </header>
  <div class="tabs-wrapper">
    <Tabs {tabs} {getCurrentTabValue} currentTab={activeTab.viewType} />
    <div class="add-event-wrapper">
      <button class="add-event-btn" onclick={addNewEvent}>Add Event</button>
    </div>
    <!-- For smaller screens -->
    <div class="add-event-wrapper-sm">
      <button class="add-event-btn-sm flex-center" onclick={addNewEvent}>
        <img src={add} alt="" />
      </button>
    </div>
  </div>
  <AddEvent defaultValue={tempEventHolder} bind:activeModal />
  <div class="tab-content" in:fade={{ duration: 300 }}>
    {@render taskList(activeTab.viewType)}
  </div>
</section>

<style>
  .bookings-page {
    padding: 1rem;
    flex: 1;
    display: flex;
    gap: 10px;
    flex-direction: column;
    overflow-y: auto;
  }

  header {
    background-color: #fff;
    padding: 10px 10px;
    border-radius: 10px;

    h1 {
      color: #081c2c;
      margin-bottom: 10px;
    }

    p {
      color: #909397;
    }
  }

  .tabs-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .add-event-wrapper {
    position: relative;
  }

  .add-event-wrapper-sm {
    position: fixed;
    bottom: 50px;
    right: 10px;
    display: none;
    z-index: 1;
  }

  .add-event-btn {
    margin-left: auto;
    padding: 8px;
    background-color: #7e35fb;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background-color: #5a24b5;
    }
  }
  .add-event-btn-sm {
    margin-left: auto;
    padding: 8px;
    background-color: #7e35fb;
    fill: white;
    border: none;
    border-radius: 50px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background-color: #5a24b5;
    }
  }

  .tab-content:first-child .date-section {
    color: #ff5722;
  }

  .month-group {
    margin-bottom: 20px;
  }

  .month-group h3 {
    color: #333;
    font-size: 1.2em;
    margin-bottom: 10px;
  }

  .task-item {
    display: flex;
    align-items: center;
    padding: 7px 15px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .date-section {
    text-align: center;
    padding-inline: 20px;
    margin-right: 10px;
    border-right: 1px solid #e0e0e0;
  }

  .date-section .day {
    font-size: 1.2em;
  }

  .date-section .date {
    font-size: 1.5em;
    font-weight: bold;
  }

  .details-section {
    flex-grow: 1;
  }

  .details-section .time {
    display: flex;
    align-items: center;
    font-size: 0.9em;
    color: #555;
    margin-bottom: 5px;
  }

  .details-section .task-title {
    font-size: 1em;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
  }

  .details-section .location {
    font-size: 0.9em;
    line-height: 1.3;
    margin-bottom: 5px;
    color: #777;
  }

  .people {
    font-size: 0.85em;
    color: #555;
    font-family: sans-serif;
  }

  .edit-button {
    margin-left: 10px;
    position: relative;
  }

  .edit-options {
    position: absolute;
  }

  .edit-button {
    position: relative;
    display: inline-block;
    background-color: #ffffff;
    border: 1px solid #d1d5db;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 8px;
    color: #111827;
    font-weight: 500;
  }

  .edit-button:focus {
    background-color: #000;
    color: #f0f0f0;
  }

  .edit-options {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 8px 0;
    width: 180px;
    display: none;
    z-index: 1;
  }

  .edit-button:hover .edit-options {
    display: block;
  }

  .edit-options button {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 16px;
    background: none;
    border: none;
    color: #111827;
    font-size: 14px;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .edit-options button:hover {
    background-color: #f3f4f6;
  }

  .edit-options button img {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }

  .remove-option {
    color: #ef4444;
  }

  @media (max-width: 400px) {
    .add-event-wrapper {
      display: none;
    }
    .add-event-wrapper-sm {
      display: block;
      left: "";
    }

    .task-item {
      flex-direction: column;
      align-items: flex-start;
      padding: 10px;
    }

    .date-section {
      padding: 0;
      margin-right: 0;
      border-right: none;
      margin-bottom: 8px;
    }

    .date-section .day,
    .date-section .date {
      display: inline;
      font-size: 1em;
    }

    .details-section .time,
    .details-section .location,
    .people {
      font-size: 0.85em;
    }

    .details-section .task-title {
      font-size: 0.95em;
    }

    .edit-button {
      margin-left: 0;
      margin-top: 8px;
    }

    .edit-options {
      top: 0px;
      left: 50px;
      right: unset;
    }
  }
</style>
