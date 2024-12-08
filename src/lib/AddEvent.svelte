<script lang="ts">
  import type { bgColor, Events, OptionType } from "../utils/types";
  import dayjs from "dayjs";
  import clockIcon from "../assets/clock.svg";
  import close from "../assets/close.svg";
  import colon from "../assets/colon.svg";
  import calendar from "../assets/calender.svg";
  import users from "../assets/users.svg";
  import location from "../assets/location.svg";
  import link from "../assets/link.svg";
  import description from "../assets/description.svg";
  import { fade } from "svelte/transition";
  import { events } from "../store/store.svelte";

  type Props = {
    defaultValue?: Events;
    activeModal: string | null;
  };
  type Target = "people" | "places";

  let { defaultValue, activeModal = $bindable() }: Props = $props();

  let emptyField: Record<string, string> = $state({});
  let dialogRef: HTMLDialogElement | undefined = $state();
  let taskDetails: Events = $state({
    id: "",
    task: "",
    description: "",
    link: "",
    date: "",
    startTime: [],
    endTime: [],
    createdOn: [],
    places: [],
    people: [],
    eventType: {
      text: "Upcoming",
      color: "#006BFF",
    },
    background: "#ffb7b77d",
  });

  let uniqueID = $state("");
  let options: OptionType[] = $state([
    { text: "Upcoming", color: "#006BFF" },
    { text: "Pending", color: "#5deb6f" },
    { text: "New", color: "#219B9D" },
    { text: "Cancelled", color: "#FF4545" },
  ]);
  let colors: bgColor[] = [
    "#D8EAFE",
    "#FFF8D8",
    "#DFFFD6",
    "#ffb7b77d",
    "#ffffff",
    "#d8d8d8",
    "#decdfb",
  ];
  let timeFormat = $state({
    startTime: {
      checked: false,
      hour: "",
      minute: "",
      meridien: "",
    },
    endTime: {
      checked: false,
      hour: "",
      minute: "",
      meridien: "",
    },
  });

  $effect(() => {
    uniqueID = String(Date.now());
    activeModal; // used as dependency here

    if (taskDetails.startTime.length > 0) {
      timeFormat.startTime = {
        checked: taskDetails.startTime[1] === "PM",
        hour: taskDetails.startTime[0].slice(0, 2),
        minute: taskDetails.startTime[0].slice(3),
        meridien: taskDetails.startTime[1],
      };
    }
    if (taskDetails.endTime.length > 0) {
      timeFormat.endTime = {
        checked: taskDetails.endTime[1] === "PM",
        hour: taskDetails.endTime[0].slice(0, 2),
        minute: taskDetails.endTime[0].slice(3),
        meridien: taskDetails.endTime[1],
      };
    }
  });

  $effect(() => {
    if (activeModal !== null) {
      dialogRef?.showModal();
    }
    if (defaultValue) {
      taskDetails = $state.snapshot(defaultValue);
    }
  });

  const handleEnter = (e: KeyboardEvent, target: keyof Events) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (target === "people" || target === "places") {
        taskDetails[target].push(
          emptyField[target][0].toUpperCase() + emptyField[target].slice(1)
        );
        emptyField[target] = "";
      }
    }
  };

  const removeItem = (index: number, target: Target) => {
    taskDetails[target].splice(index, 1);
  };

  const handleAddEvent = (e: SubmitEvent) => {
    e.preventDefault();
    if (taskDetails.date === "") {
      taskDetails.date = dayjs(new Date()).format("YYYY-MM-DD");
    }
    const date = dayjs(new Date()).format("YYYY-MM-DD");
    const time = dayjs(new Date()).format("hh:mm A");
    taskDetails.createdOn = [date, time];
    taskDetails.id = uniqueID;
    events.push(taskDetails);
    taskDetails = {
      id: "",
      task: "",
      description: "",
      link: "",
      date: "",
      startTime: [],
      endTime: [],
      createdOn: [],
      places: [],
      people: [],
      eventType: {
        text: "Upcoming",
        color: "#006BFF",
      },
      background: "#ffb7b77d",
    };
    activeModal = null;
  };

  const handleTimeInput = (e: Event) => {
    const target = e.target as HTMLInputElement | null;
    if (target) {
      const transformMinToNum = Number(target.min);
      const transformMaxToNum = Number(target.max);
      const value = Number(target.value);

      if (value < transformMinToNum) {
        target.value = transformMinToNum.toString().padStart(2, "0");
      } else if (value > transformMaxToNum) {
        target.value = transformMaxToNum.toString().padStart(2, "0");
      }
    }
  };

  const handleMeridian = (e: Event, type: "startTime" | "endTime") => {
    const eventTarget = e.target as HTMLInputElement | null;
    if (eventTarget?.checked) {
      timeFormat[type].meridien = "PM";
      timeFormat[type].checked = false;
    } else {
      timeFormat[type].meridien = "AM";
      timeFormat[type].checked = true;
    }
    taskDetails[type] = [
      `${timeFormat[type].hour}:${timeFormat[type].minute}`,
      `${timeFormat[type].meridien}`,
    ];
  };

  const updateTimeInput = (e: Event, type: "startTime" | "endTime") => {
    const eventTarget = e.target as HTMLInputElement;
    const { name, value } = eventTarget;
    if (name === "hour") {
      timeFormat[type].hour = value.padStart(2, "0");
      timeFormat[type].minute = "00";
    } else if (name === "minute") {
      timeFormat[type].minute = value.padStart(2, "0");
    }
    taskDetails[type] = [
      `${timeFormat[type].hour}:${timeFormat[type].minute}`,
      `${timeFormat[type].meridien}`,
    ];
  };

  const handleNewUpdate = () => {
    const findIndex = events.findIndex((item) => item.id === taskDetails.id);
    events.splice(findIndex, 1, taskDetails);
    closeModal();
  };

  const closeModal = () => {
    if (activeModal !== null) {
      activeModal = null;
    }
    dialogRef?.close();
  };
</script>

<!-- Lists e.g. places, people names -->
{#snippet item(items: string[], target: Target)}
  {#if items.length !== 0}
    <div class="list-container">
      {#each items as item, index}
        <div class="item">
          <div>{item}</div>
          <button
            class="deleteItem-btn"
            type="button"
            onclick={() => removeItem(index, target)}
          >
            <img src={close} alt="close-logo" class="close-icon-multiSelect" />
          </button>
        </div>
      {/each}
    </div>
  {/if}
{/snippet}

<!-- Clock -->
{#snippet clock(target: "startTime" | "endTime")}
  <div class="time-wrapper">
    <div class="clock">
      <input
        type="number"
        name="hour"
        class="clock-box"
        min={0}
        max={12}
        placeholder="hh"
        bind:value={timeFormat[target].hour}
        oninput={handleTimeInput}
        onblur={(e) => updateTimeInput(e, target)}
      />
      <img src={colon} alt="colon-logo" class="colon-icon" />
      <input
        type="number"
        name="minute"
        class="clock-box"
        min={0}
        max={59}
        placeholder="mm"
        bind:value={timeFormat[target].minute}
        oninput={handleTimeInput}
        onblur={(e) => updateTimeInput(e, target)}
      />
    </div>
    <div>
      <input
        type="checkbox"
        name={`${target}_tweleveHourFormat`}
        id={`${target}_tweleveHourFormat`}
        onchange={(e) => handleMeridian(e, target)}
        hidden
      />
      <label for={`${target}_tweleveHourFormat`} class="tweleveHourFormat"
        >{timeFormat[target].checked ? "PM" : "AM"}</label
      >
    </div>
  </div>
{/snippet}

<!-- Task types -->
{#snippet taskType()}
  <div class="task-type-group">
    {#each options as option}
      <input
        type="radio"
        value={option.text}
        name={"eventType"}
        id={option.text}
        bind:group={taskDetails.eventType.text}
      />
      <label
        class="radio-label"
        for={option.text}
        style={`border-color: ${option.color}; --set-bg:${option.color}`}
        >{option.text}</label
      >
    {/each}
  </div>
{/snippet}

<!-- Event Modal -->
{#snippet eventModal()}
  <dialog bind:this={dialogRef} class="position-middle">
    <form
      class=""
      onsubmit={handleAddEvent}
      style={defaultValue && "position: static; width: 370px;"}
      transition:fade={{ duration: 150 }}
    >
      <div class="task-name">
        <!-- svelte-ignore a11y_autofocus -->
        <input
          type="text"
          placeholder="Task name"
          bind:value={taskDetails.task}
        />
        <button type="button" onclick={closeModal}>
          <img src={close} alt="close-icon" class="close-icon" />
        </button>
      </div>
      <div class="people-list">
        <img src={users} alt="users-logo" class="users-icon" />
        <div class="input-wrapper">
          {@render item(taskDetails.people, "people")}
          <input
            type="text"
            placeholder="Add people"
            bind:value={emptyField["people"]}
            onkeydown={(e) => handleEnter(e, "people")}
          />
        </div>
      </div>
      <div class="schedule-time">
        <img src={calendar} alt="schedule-time-logo" class="calender-icon" />
        <input
          type="text"
          placeholder="Schedule time"
          bind:value={taskDetails.date}
          onkeydown={(e) => handleEnter(e, "date")}
        />
      </div>
      <div class="places">
        <img src={location} alt="location-logo" class="location-icon" />
        <div class="input-wrapper">
          {@render item(taskDetails.places, "places")}
          <input
            type="text"
            placeholder="Places"
            bind:value={emptyField["places"]}
            onkeydown={(e) => handleEnter(e, "places")}
          />
        </div>
      </div>
      <div class="link">
        <img src={link} alt="link-logo" class="link-icon" />
        <input
          type="text"
          placeholder="Link"
          bind:value={taskDetails.link}
          onkeydown={(e) => handleEnter(e, "link")}
        />
      </div>
      <div class="times">
        <div class="start-time">
          <img src={clockIcon} alt="clock-logo" class="clock-icon" />
          <div class="clock-type">
            <span>Start</span>
            {@render clock("startTime")}
          </div>
        </div>
        <div class="end-time">
          <img src={clockIcon} alt="clock-logo" class="clock-icon" />
          <div class="clock-type">
            <span>End</span>
            {@render clock("endTime")}
          </div>
        </div>
      </div>
      <div class="task-type">
        {@render taskType()}
      </div>
      <div class="description">
        <img
          src={description}
          alt="description-logo"
          class="description-icon"
        />
        <textarea
          placeholder="Description"
          bind:value={taskDetails.description}
          onkeydown={(e) => handleEnter(e, "description")}
        ></textarea>
      </div>
      <div class="theme-container">
        {#each colors as bgColor}
          <input
            type="radio"
            id={bgColor}
            name="color"
            value={bgColor}
            bind:group={taskDetails.background}
          />
          <label
            for={bgColor}
            class="color-circle"
            style="background-color: {bgColor};"
          ></label>
        {/each}
      </div>
      {#if activeModal === "addEvent"}
        <button class="create-btn" type="submit">Create</button>
      {:else}
        <button class="create-btn" type="button" onclick={handleNewUpdate}
          >Update</button
        >
      {/if}
    </form>
  </dialog>
{/snippet}

{#if activeModal !== null}
  {@render eventModal()}
{/if}

<style>
  dialog {
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
  }
  form {
    background: white;

    padding: 16px 20px;
    width: 300px;
    height: fit-content;
    overflow-y: auto;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  input,
  textarea {
    width: 100%;
    outline: none;
    color: #666;
    font-size: 14px;
    padding: 4px;
    border: 1px solid #9999997d;
    border-radius: 5px;
  }

  input::placeholder {
    color: #999;
  }

  input:hover {
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 4px;
  }

  input:focus {
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 4px;
  }

  .create-btn {
    width: 100%;
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

  .task-name {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    position: relative;
  }

  .task-name input {
    width: 100%;
    border: none;
    font-size: 16px;
    padding: 8px;
    color: #333;
    background-color: #e9e9e999;
  }

  .close-icon {
    width: 20px;
    height: 20px;
    cursor: pointer;
    position: absolute;
    right: 0;
    top: -10px;
    transform: translateY(-50%);
  }

  .people-list {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
  }

  .users-icon {
    width: 20px;
    height: 20px;
    opacity: 0.6;
  }

  .schedule-time,
  .places,
  .link,
  .description {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
  }

  .description {
    align-items: flex-start;
  }

  .link input {
    color: #659bff;
  }

  .calender-icon,
  .link-icon,
  .location-icon,
  .clock-icon,
  .description-icon {
    width: 20px;
    height: 20px;
    opacity: 0.6;
  }

  .times {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
  }

  .start-time,
  .end-time {
    display: flex;
    align-items: flex-end !important;
    gap: 8px;
  }

  .time-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .clock-type {
    position: relative;
    font-size: 12px;
    color: #999;
  }

  .clock {
    display: flex;
    border: 1px solid #9999997d;
    border-radius: 4px;
  }

  .clock-box {
    border: none;
    appearance: textfield;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  .tweleveHourFormat {
    display: flex;
    align-items: center;
    padding: 2px;
    border: 1px solid #9999997d;
    border-radius: 4px;
    cursor: pointer;
    background-color: #999;
    color: #e1e1e1;
    font-weight: 500;
  }

  .colon-icon {
    width: 13px;
    fill: #333;
  }

  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    outline: none;
    color: #666;
    font-size: 14px;
    padding: 4px;
    border: 1px solid #9999997d;
    border-radius: 5px;

    & input {
      border: none;
      width: auto;
    }
  }

  .list-container {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .item {
    font-size: 14px;
    background-color: #e1e1e1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 4px;
    border-radius: 5px;
    line-height: 1;
    text-transform: capitalize;
  }

  .close-icon-multiSelect {
    width: 16px;
    cursor: pointer;
  }

  .task-type-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3px;
    margin-bottom: 10px;
    margin-left: 28px;

    .radio-label {
      color: #666;
      cursor: pointer;
      font-size: 14px;
      background-color: #fff;
      border: 1.5px solid #e1e1e1;
      border-radius: 4px;
      padding: 2px 3px;
    }

    input[type="radio"] {
      display: none;
    }

    input[type="radio"]:checked + .radio-label {
      background-color: var(--set-bg);
      color: #e1e1e1;
      border: 1px solid #737574;
    }
  }

  @media (max-width: 400px) {
    form {
      width: 80vw;
    }
  }

  .theme-container {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-left: 26px;
    margin-block: 10px;

    input[type="radio"] {
      display: none;
    }
    input[type="radio"]:checked + .color-circle {
      border-color: #5c636aa1;
    }
  }
  .color-circle {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid transparent;
    cursor: pointer;
    transition: border-color 0.2s ease-in-out;
  }
</style>
