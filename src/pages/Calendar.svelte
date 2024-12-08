<script lang="ts">
  import dayjs from "dayjs";
  import Tabs from "../lib/Tabs.svelte";
  import AddEvent from "../lib/AddEvent.svelte";
  import calendar from "../assets/calender.svg";
  import leftArrow from "../assets/chevronLeftArrow.svg";
  import rightArrow from "../assets/chevronRightArrow.svg";
  import close from "../assets/close.svg";
  import { events } from "../store/store.svelte";
  import { type Events } from "../utils/types";
  import { createDateAndTimeFromId, createID } from "../utils/functions";
  import {
    deleteSlide,
    eventSlide,
  } from "../custom_trasnsitions-animations/custom_trasnsitions-animations";
  import { flip } from "svelte/animate";
  import { fade, fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  // Type casting
  interface GroupedEventsObject {
    hourly: {
      [x: string]: Array<Events>;
    };
    daily: {
      [x: string]: Array<Events>;
    };
  }
  type ActiveTabInterface =
    | { viewType: "Week"; eventsGroupedAs: "hourly" }
    | { viewType: "Month"; eventsGroupedAs: "daily" }
    | { viewType: "Year"; eventsGroupedAs: "daily" };

  let tabs = [
    { id: 0, title: "Week" },
    { id: 1, title: "Month" },
    { id: 2, title: "Year" },
  ];
  let totalHours = [
    "12 AM",
    "1 AM",
    "2 AM",
    "3 AM",
    "4 AM",
    "5 AM",
    "6 AM",
    "7 AM",
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
    "6 PM",
    "7 PM",
    "8 PM",
    "9 PM",
    "10 PM",
    "11 PM",
  ];
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let totalWeeks: Record<number, Record<string, number>> = $state({});
  let activeTab: ActiveTabInterface = $state({
    viewType: "Year",
    eventsGroupedAs: "daily",
  });
  let showMonthAndYearList = $state(false);
  let activeWeek = $state(1);
  let activeDay: string | null = $state(null);
  let currentMonth = $state(dayjs().format("MMMM"));
  let currentYear: number = $state(dayjs().year());
  let currentMonthIndex: number = $state(dayjs().month());
  let groupedEvents: GroupedEventsObject = $state({
    hourly: {},
    daily: {},
  });
  let dialogRef: HTMLDialogElement | undefined = $state();
  let activeModal: string | null = $state(null);
  let tempEventsHolder: Events | undefined = $state(undefined);
  let fullYear: Record<string, typeof totalWeeks> = $state({});
  let years = $derived(
    Array.from({ length: currentYear - 1971 + 200 }, (_, i) => 1971 + i)
  );

  $effect(() => {
    let daysInMonth: { [x: string]: number[] } = {},
      daysWithNames: { [x: string]: { [y: string]: number }[] } = {},
      weeks = {};

    months.forEach((month, index) => {
      let weekNo = 1;
      let lastDate = new Date(currentYear, index + 1, 0).getDate();
      Array.from({ length: lastDate }, (_, i) => {
        if (!daysInMonth[month]) {
          daysInMonth[month] = [];
        }
        if (!daysWithNames[month]) {
          daysWithNames[month] = [];
        }
        daysInMonth[month].push(i + 1);
      });

      daysInMonth[month].forEach((_, i) => {
        let shiftedIndex = i + 1;
        let d = new Date(currentYear, index, shiftedIndex).getDay();
        let dayName = days[d];

        if (dayName) {
          daysWithNames[month].push({ [dayName]: shiftedIndex });
        }
      });

      // Group days into weeks
      weeks = daysWithNames[month].reduce((acc, curr) => {
        const weekKey = `${weekNo}`;
        if (!acc[weekKey]) {
          acc[weekKey] = {};
        }
        acc[weekKey] = {
          ...acc[weekKey],
          ...curr,
        };
        if (Object.keys(curr)[0] === "Saturday") {
          weekNo++;
        }
        return acc;
      }, {});

      fullYear[month] = weeks;
    });
  });

  $effect(() => {
    groupedEvents.hourly = events.reduce(
      (acc: Record<string, Events[]>, curr) => {
        const modifiedKey = createID(curr.date, curr.startTime);
        if (!acc[modifiedKey]) {
          acc[modifiedKey] = [];
        }
        acc[modifiedKey].push(curr);
        return acc;
      },
      {}
    );

    groupedEvents.daily = events.reduce(
      (acc: Record<string, Events[]>, curr) => {
        const modifiedKey = createID(curr.date);
        if (!acc[modifiedKey]) {
          acc[modifiedKey] = [];
        }
        acc[modifiedKey].push(curr);
        return acc;
      },
      {}
    );
  });

  function getCurrentTabValue(currentTab: string) {
    if (currentTab === "Week") {
      activeTab = {
        eventsGroupedAs: "hourly",
        viewType: "Week",
      };
    } else if (currentTab === "Month" || currentTab === "Year") {
      activeTab = {
        eventsGroupedAs: "daily",
        viewType: currentTab,
      };
    }
  }

  function updateNextDate() {
    if (activeTab.viewType === "Year") {
      currentYear++;
    } else {
      if (currentMonthIndex === 11) {
        currentMonthIndex = 0;
        currentYear++;
      } else {
        currentMonthIndex++;
      }
      currentMonth = dayjs(`${currentYear}-${currentMonthIndex + 1}`).format(
        "MMMM"
      );

      activeWeek = 1;
    }
  }

  function updatePreviousDate() {
    if (activeTab.viewType === "Year") {
      currentYear--;
    } else {
      if (currentMonthIndex === 0) {
        currentMonthIndex = 11;
        currentYear--;
      } else {
        currentMonthIndex--;
      }
      currentMonth = dayjs(`${currentYear}-${currentMonthIndex + 1}`).format(
        "MMMM"
      );

      activeWeek = 1;
    }
  }

  function formatTime(time: string[]) {
    return time ? time.join(" ") : null;
  }

  function createKeyFromWeekDay(modifiedHour: string, day: string) {
    const dayIndex = String(fullYear[currentMonth]?.[activeWeek]?.[day]);

    if (dayIndex)
      return `${currentYear}-${String(months.indexOf(currentMonth) + 1).padStart(2, "0")}-${String(
        fullYear[currentMonth]?.[activeWeek]?.[day]
      ).padStart(2, "0")}#${modifiedHour}`;
  }

  function deletTask(e: Event, id: string) {
    e.stopPropagation();
    const findId = events.findIndex((item) => item.id === id);
    events.splice(findId, 1);
  }

  function handleEventsDialog(key: string | undefined, day: string) {
    const dayIndex = fullYear[currentMonth][activeWeek]?.[day];

    if (key?.includes("undefined")) return;
    if (dayIndex && key) {
      activeDay = key;
      dialogRef?.showModal();
    }
  }

  function closeDialog(e: Event) {
    if (dialogRef) {
      e.stopPropagation();
      dialogRef.close();
    }
    activeDay = null;
    activeModal = null;
  }

  function addNewEvent() {
    const timestamp = String(Date.now());
    const { date, formattedTime } = createDateAndTimeFromId(activeDay);
    const [st, period] = formattedTime.split(" ");

    if (activeDay !== null) {
      activeModal = "addEvent";
      tempEventsHolder = {
        id: timestamp,
        task: "",
        description: "",
        link: "",
        date: date,
        startTime: [st, period],
        endTime: [],
        createdOn: [date, formattedTime],
        places: [],
        people: [],
        eventType: {
          text: "Upcoming",
          color: "#006BFF",
        },
        background: "#ffb7b77d",
      };
      dialogRef?.close();
    }
  }
  {
    $inspect(activeTab, groupedEvents[activeTab.eventsGroupedAs]);
  }
</script>

<!-- Events Dialog -->
{#snippet dialog()}
  <div>
    <dialog
      bind:this={dialogRef}
      class="dialog position-middle"
      transition:fade
    >
      <div>
        <div class="dialog-header">
          <div>
            <h3 class="dialog-title">Create or update your events</h3>
            <p class="dialog-subtitle">See all your events here.</p>
          </div>
          <button onclick={closeDialog} class="close-button">
            <img src={close} alt="close-dialog" class="close-dialog-icon" />
          </button>
        </div>

        <div class="all-events">
          {#if activeDay && !groupedEvents[activeTab.eventsGroupedAs][activeDay]}
            <p class="no-events-msg">No events for today!</p>
          {:else}
            {#each groupedEvents[activeTab.eventsGroupedAs][activeDay as string] as event, index (event.id)}
              <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of reasons) -->
              <div
                class="event"
                style={`background-color: ${event.background}`}
                in:eventSlide={{ duration: 300, delay: 100, index }}
                out:deleteSlide={{ duarion: 200 }}
                animate:flip={{ duration: 300 }}
                onclick={() => {
                  activeModal = event.id;
                  tempEventsHolder = event;
                }}
              >
                <div
                  class="event-type"
                  style={`border-color: ${event.eventType.color}; color: ${event.eventType.color}`}
                >
                  {event.eventType.text}
                </div>
                <p class="event-task">
                  {event.task || "#" + event.id.slice(10)}
                </p>
                <div class="event-time">
                  <p>
                    {#if event.startTime.length > 0 && event.endTime.length > 0}
                      {formatTime(event.startTime)} - {formatTime(
                        event.endTime
                      )}
                    {:else if event.startTime.length > 0}
                      From {formatTime(event.startTime)}
                    {:else if event.endTime.length > 0}
                      End {formatTime(event.endTime)}
                    {/if}
                  </p>
                  <button
                    type="button"
                    class="delete-button"
                    onclick={(e) => deletTask(e, event.id)}
                    aria-label="delete-task"
                  >
                    <svg
                      class="delete-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            {/each}
          {/if}
        </div>

        <div class="dialog-footer">
          <button
            type="button"
            class="button button-secondary"
            onclick={closeDialog}
          >
            Close
          </button>
          <button
            type="button"
            class="button button-primary"
            onclick={addNewEvent}
          >
            Add
          </button>
        </div>
      </div>
    </dialog>
    <AddEvent bind:activeModal defaultValue={tempEventsHolder} />
  </div>
{/snippet}

<!-- Events shown hourly based -->
{#snippet eventsInCellHourly(key: string | undefined, day: string)}
  {#each Object.keys(groupedEvents.hourly) as groupedEventsHourlyID}
    {#if groupedEventsHourlyID === key}
      <div
        class="grouped-events-wrapper"
        role="button"
        tabindex="0"
        onclick={() => handleEventsDialog(key, day)}
        onkeydown={(e) => e.key === "Enter" && handleEventsDialog(key, day)}
      >
        {#each groupedEvents.hourly[key].slice(0, 2) as event}
          <div style={`background-color: ${event.background}`} class="event">
            <p class="event-task">{event.task || "#" + event.id}</p>
            <p class="event-time">
              {`${event.startTime.join(" ")} - ${event.endTime.join(" ")}`}
            </p>
          </div>
        {/each}
        {#if groupedEvents.hourly[key].length > 2}
          <div class="other-events" style={`background-color: #ded9de`}>
            {groupedEvents.hourly[key].slice(2).length}
          </div>
        {/if}
      </div>
    {/if}
  {/each}
{/snippet}

<!-- Events shown daily based -->
{#snippet eventsInCellDaily(key: string | undefined, day: string)}
  {#each Object.keys(groupedEvents.daily) as groupedEventsDailyID}
    {#if groupedEventsDailyID === key}
      <div
        class="grouped-events-wrapper"
        role="button"
        tabindex="0"
        onclick={() => handleEventsDialog(key, day)}
        onkeydown={(e) => e.key === "Enter" && handleEventsDialog(key, day)}
      >
        {#each groupedEvents.daily[key].slice(0, 2) as event}
          <div style={`background-color: ${event.background}`} class="event">
            <p class="event-task">{event.task || "#" + event.id}</p>
            <p class="event-time">
              {`${event.startTime.join(" ")} - ${event.endTime.join(" ")}`}
            </p>
          </div>
        {/each}
        {#if groupedEvents.daily[key].length > 2}
          <div class="other-events" style={`background-color: #ded9de`}>
            {groupedEvents.daily[key].slice(2).length}
          </div>
        {/if}
      </div>
    {/if}
  {/each}
{/snippet}

<!-- Active Month and Year Tab -->
{#snippet activeMonthAndYear()}
  <button
    type="button"
    class="currentMonth"
    onclick={() => (showMonthAndYearList = !showMonthAndYearList)}
  >
    <img src={calendar} alt="calender-logo" class="calender-logo" />
    {currentMonth + " " + currentYear}
    <span class="arrow-icon"> &#129175 </span>
  </button>
  {#if showMonthAndYearList}
    <div class="year-month-selector" transition:fade={{ duration: 200 }}>
      <div
        class="popup"
        transition:fly={{ y: 200, duration: 300, easing: quintOut }}
      >
        <div class="selector-container">
          {#if activeTab.viewType !== "Year"}
            <div class="months-column">
              <h3>Months</h3>
              <div class="scrollable-list months">
                {#each months as month, index}
                  <button
                    class="selector-item"
                    class:active={currentMonth === month}
                    onclick={() => (currentMonth = month)}
                  >
                    {month}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <div class="years-column">
            <h3>Years</h3>
            <div class="scrollable-list years">
              {#each years as yearNo}
                <button
                  class="selector-item"
                  class:active={yearNo === currentYear}
                  onclick={() => (currentYear = yearNo)}
                >
                  {yearNo}
                </button>
              {/each}
            </div>
          </div>
        </div>

        <div class="selected-info">
          <p>Selected: {currentMonth} {currentYear}</p>
          <div class="actions">
            <button
              class="btn-cancel"
              onclick={() => (showMonthAndYearList = !showMonthAndYearList)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
{/snippet}

<!-- Calendar weekly view -->
{#snippet weekView()}
  <table class="week-view" in:fade={{ duration: 150 }}>
    <thead>
      <tr class="thead">
        <th class="top-left-navigation-cell">
          <button
            type="button"
            class="arrow left-arrow"
            onclick={() => (activeWeek === 1 ? 1 : activeWeek--)}
          >
            <img src={leftArrow} alt="left-arrow-icon" />
          </button>
          <div class="current-week-no">
            {activeWeek}
          </div>
          <button
            type="button"
            class="arrow right-arrow"
            onclick={() =>
              activeWeek === Object.keys(fullYear[currentMonth]).length
                ? Object.keys(fullYear[currentMonth]).length
                : activeWeek++}
          >
            <img src={rightArrow} alt="right-arrow-icon" />
          </button>
        </th>
        {#each days as day}
          <th class="day">
            <p>{day.slice(0, 3)}</p>
            <p class="date">
              {fullYear[currentMonth]?.[activeWeek]?.[day] ?? null}
            </p>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody class="scrollable-content">
      {#each totalHours as hour}
        <tr class="time-row">
          <td class="hour">{hour}</td>
          {#each days as day}
            {@const modifiedHour = hour
              .split(" ")[0]
              .padStart(2, "0")
              .concat("_", hour.split(" ")[1])}
            {@const key = createKeyFromWeekDay(modifiedHour, day)}
            <td class="cell" onclick={() => handleEventsDialog(key, day)}
              >{@render eventsInCellHourly(key, day)}</td
            >
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{/snippet}

<!-- Calendar monthly view -->
{#snippet monthView()}
  <table class="month-view" in:fade={{ duration: 150 }}>
    <thead>
      <tr class="thead">
        {#each days as day}
          <th class="day">
            <p>{day.slice(0, 3)}</p>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody class="">
      {#each Object.keys(fullYear[currentMonth]) as week, i}
        <tr class="week-row">
          {#each days as day}
            {@const key = `${currentYear}-${String(months.indexOf(currentMonth) + 1).padStart(2, "0")}-${String(fullYear[currentMonth][week][day]).padStart(2, "0")}`}
            <td class="cell" onclick={() => handleEventsDialog(key, day)}>
              {#if fullYear[currentMonth][week].hasOwnProperty(day)}
                {#if groupedEvents.daily[key]?.length > 0}
                  {@render eventsInCellDaily(key, day)}
                {:else}
                  {fullYear[currentMonth][week][day]}
                {/if}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{/snippet}

<!-- Calendar yearly view -->
{#snippet yearView()}
  <div class="full-year-view" in:fade={{ duration: 150 }}>
    {#each Object.keys(fullYear) as month}
      <div class="month-container">
        <div class="month-name">
          {month}
        </div>
        <table class="month">
          <thead>
            <tr class="thead">
              {#each days as day}
                <th class="day">
                  <p>{day.slice(0, 3)}</p>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody class="body">
            {#each Object.keys(fullYear[month]) as week, index}
              <tr class="week-row">
                {#each days as day}
                  {@const convertedDayStrToNum = String(
                    fullYear[month][week][day]
                  ).padStart(2, "0")}
                  {@const currentMonthIndex = String(
                    dayjs(`${month} ${currentYear}`).month() + 1
                  ).padStart(2, "0")}
                  {@const key = `${currentYear}-${currentMonthIndex}-${convertedDayStrToNum}`}
                  <td class="cell" onclick={() => handleEventsDialog(key, day)}>
                    {#if fullYear[month][week].hasOwnProperty(day)}
                      {fullYear[month][week][day]}
                    {/if}
                    {#if groupedEvents.daily[key]?.length > 0}
                      <div
                        class="other-events"
                        style={`background-color: #ded9de`}
                      >
                        {groupedEvents.daily[key]?.length}
                      </div>
                    {/if}
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/each}
  </div>
{/snippet}

<section class="calender-wrapper">
  <header class="header">
    <h2>Reservations</h2>
    <p>Manage and track your reservations</p>
  </header>
  <div class="tabs-wrapper">
    {@render activeMonthAndYear()}
    <Tabs {tabs} {getCurrentTabValue} currentTab={activeTab.viewType} />
    <button
      type="button"
      class="gotoTodayBtn"
      onclick={() => {
        (currentMonth = dayjs().format("MMMM")), (currentYear = dayjs().year());
      }}>Today</button
    >
    <div class="navigations-wrapper">
      <button type="button" onclick={updatePreviousDate}>&#129104</button>
      <button type="button" onclick={updateNextDate}>&#129106</button>
    </div>
  </div>
  <div class="calender">
    {#if activeTab.viewType === "Month"}
      {@render monthView()}
    {:else if activeTab.viewType === "Week"}
      {@render weekView()}
    {:else if activeTab.viewType === "Year"}
      {@render yearView()}
    {/if}
  </div>
  {@render dialog()}
</section>

<style>
  .calender-wrapper {
    flex: 1;
    display: flex;
    gap: 10px;
    flex-direction: column;
    overflow: hidden;
    padding-inline: 16px;
    /* padding-bottom: 1em; */

    .header {
      background-color: #fff;
      padding: 10px 10px;
      border-radius: 10px;

      h2 {
        color: #081c2c;
        margin-bottom: 10px;
      }

      p {
        color: #909397;
      }
    }
  }

  table {
    border-spacing: 0;
    border: 1px solid #ccc;
  }

  .all-events {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 100px;
    gap: 16px;
    margin-bottom: 24px;
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 8px;
    background: transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #ddd;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #ccc;
    }

    .event {
      border: 2px solid transparent;
      border-radius: 8px;
      padding: 12px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .event:hover,
    .event:active {
      border-color: #7c3aed;
      background-color: #f5f0ff;
      transform: translateX(4px);
    }

    .event-task {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 500;
      color: #424040;
    }

    .event-time {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #000;

      p {
        margin-bottom: unset;
      }
    }

    .event-type {
      display: inline-block;
      border-radius: 25px;
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 400;
      vertical-align: middle;
    }

    .delete-button {
      svg {
        width: 13px;
        height: 13px;
        fill: #1313137b;
        filter: unset;
      }
    }
  }

  .tabs-wrapper {
    display: flex;
    gap: 15px;
  }

  .gotoTodayBtn {
    background-color: #fff;
    padding: 10px;
    border-radius: 10px;
    font-size: 14px;
    display: flex;
    gap: 10px;
    align-items: center;
    cursor: pointer;
  }

  .currentMonth {
    background-color: #fff;
    padding: 10px;
    border-radius: 10px;
    font-size: 14px;
    display: flex;
    gap: 10px;
    align-items: center;
    cursor: pointer;
  }

  .calender-logo {
    width: 20px;
  }

  .arrow-icon {
    font-size: 28px;
    height: 23px;
  }

  .navigations-wrapper {
    display: flex;
    margin-left: auto;
    gap: 10px;
  }

  .navigations-wrapper button {
    background-color: #fff;
    padding: 10px;
    border-radius: 10px;
    font-size: 14px;
    cursor: pointer;
  }

  .navigations-wrapper button:focus {
    background-color: #dad7f8;
  }

  .calender {
    flex-grow: 1;
    overflow-y: scroll;
  }

  .thead {
    border-bottom: 1px solid #d9dde0;
    background-color: #f3f5f7;
    display: grid;
    grid-template-rows: 35px;
    justify-items: center;
    text-align: center;
    padding: 5px;
    overflow: hidden;
  }

  .week-view {
    height: 100%;
    width: 100%;
    background-color: #fff;
    border-radius: 10px;
    overflow: hidden;

    .thead {
      grid-template-columns: repeat(8, minmax(140px, 1fr));
      background-color: #f3f5f7;
    }

    .time-row {
      grid-template-columns: repeat(8, minmax(140px, 1fr));
    }
  }
  .month-view {
    width: 100%;
    border-radius: 10px;
    overflow: hidden;

    .thead {
      grid-template-columns: repeat(7, minmax(140px, 1fr));
    }
    .week-row {
      grid-template-columns: repeat(7, minmax(140px, 1fr));
    }
  }

  .full-year-view {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;

    .month {
      width: 100%;
      height: 100%;
      border-radius: 10px;
      overflow: hidden;

      .month-name {
        background-color: transparent;
        font-size: 18px;
        padding: 5px;
      }
      .thead {
        grid-template-columns: repeat(7, minmax(70px, 1fr));
        background-color: #f3f5f7;
      }
      .body {
        background-color: #fff;
      }
      .week-row {
        grid-template-columns: repeat(7, minmax(70px, 1fr));
        height: 50px;

        .cell {
          /* background-color: transparent; */
          position: relative;

          .other-events {
            position: absolute;
            bottom: 2px;
            right: 3px;
          }
        }
      }
    }
  }

  .top-left-navigation-cell {
    display: flex;
    gap: 5px;
  }

  .arrow {
    font-size: 30px;
    border-radius: 50px;
    cursor: pointer;
  }
  .arrow:hover,
  .arrow:active {
    background-color: #081c2c1e;
  }

  .current-week-no {
    display: flex;
    align-items: center;
    background-color: #59595916;
    padding-inline: 10px;
    border-radius: 10px;
  }

  .day {
    display: flex;
    line-height: 2;
    gap: 7px;
    font-weight: normal;
    text-transform: uppercase;
  }

  .date {
    color: #2e98ef;
  }

  .scrollable-content {
    height: calc(100vh - 60px);
    overflow-y: auto;
    display: block;
  }

  .time-row,
  .week-row {
    border-bottom: 1px solid #e0e0e0;
    height: 125px;
    display: grid;
  }

  .hour {
    padding: 16px;
    background: #f3f5f7;
    text-align: center;
  }

  .cell {
    padding: 6px;
    overflow-wrap: break-word;
    border-left: 1px solid #e0e0e0;
    text-align: center;
    cursor: pointer;
    overflow: hidden;
    background-color: #fff;
  }
  .cell:hover,
  .cell:active {
    background-color: rgb(231, 230, 230);
  }

  .grouped-events-wrapper {
    display: flex;
    flex-direction: column;
    gap: 5px;
    height: 100%;
  }

  .event,
  .other-events {
    border-radius: 5px;
    padding: 3px 4px;
  }

  .other-events {
    display: inline;
    width: fit-content;
    margin-left: auto;
    border-radius: 100px;
    padding: 2px 8px;
  }

  .event p:first-child {
    border-radius: 5px;
    font-size: 15px;
    margin-bottom: 3px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .event p:last-child {
    font-size: 12px;
    color: #909397;
  }

  .scrollable-content::-webkit-scrollbar {
    width: 8px;
  }

  .scrollable-content::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .scrollable-content::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  /* Events Dialog */
  .dialog {
    background: white;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    border: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .dialog-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;

    .close-dialog-icon {
      cursor: pointer;
    }
  }

  .dialog-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .dialog-subtitle {
    color: #666;
    margin: 4px 0 0 0;
    font-size: 14px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #eee;
  }

  .no-events-msg {
    text-align: center;
    color: #666;
  }

  .delete-button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 4px;
    padding: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .delete-button:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .delete-icon {
    width: 16px;
    height: 16px;
    filter: brightness(0) invert(1);
  }

  .button {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
  }

  .button-secondary {
    background: white;
    border: 1px solid #ddd;
    color: #333;
  }

  .button-secondary:hover {
    background: #f5f5f5;
  }

  .button-primary {
    background: #7c3aed;
    color: white;
    border: none;
  }

  .button-primary:hover {
    background: #6d28d9;
  }

  .button-primary:disabled {
    background: #909397;
    color: #f1f1f1;
  }

  /* Month and year list tab */
  .year-month-selector {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .popup {
    position: relative;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    width: 300px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    z-index: 1001;
    overflow: hidden;
  }

  .selector-container {
    display: flex;
    border-bottom: 1px solid #e0e0e0;
  }

  .months-column,
  .years-column {
    /* width: 50%;  */
    padding: 20px;
    position: relative;
  }

  .scrollable-list {
    max-height: 400px;
    overflow-y: auto;
    padding-right: 10px;
  }

  .selector-item {
    width: 100%;
    padding: 10px;
    text-align: left;
    background-color: transparent;
    border: none;
    border-radius: 6px;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .selector-item:hover {
    background-color: #f0f0f0;
  }

  .selector-item.active {
    background-color: #3498db;
    color: white;
  }

  h3 {
    margin-bottom: 15px;
    color: #333;
    text-align: center;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
  }

  .selected-info {
    padding: 15px;
    text-align: center;
    background-color: #f9f9f9;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 15px;
  }

  .btn-cancel {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-cancel {
    background-color: #e0e0e0;
    color: #333;
  }

  .btn-cancel:hover {
    background-color: #d0d0d0;
  }

  /* Scrollbar styling for modern browsers */
  .scrollable-list::-webkit-scrollbar {
    width: 6px;
  }

  .scrollable-list::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .scrollable-list::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  .scrollable-list::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .dialog {
      padding: 16px;
      width: 95%;
    }

    .event {
      padding: 10px 12px;
    }

    .dialog-footer {
      margin-top: 16px;
    }

    .full-year-view {
      grid-template-columns: 1fr;
    }
  }
</style>
