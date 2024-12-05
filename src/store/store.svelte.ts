import type { Events } from "../utils/types";

// Example data
export let events: Events[] = $state([
  {
    id: "1730490420001",
    task: "Project Kickoff Meeting",
    description: "Discuss the roadmap for the new app launch.",
    date: "2024-12-15",
    createdOn: ["2024-12-10", "09:00 AM"],
    places: ["New York", "Online"],
    people: ["Alice, Bob, Charlie"],
    link: "https://example-link.com/kickoff",
    startTime: ["10:00", "AM"],
    endTime: ["11:30", "AM"],
    eventType: {
      text: "Upcoming",
      color: "#006BFF",
    },
    background: "#ffffff",
  },
  {
    id: "1730490420002",
    task: "Team Building Workshop",
    description: "Fun and engaging activities for better team bonding.",
    date: "2024-12-20",
    createdOn: ["2024-12-05", "02:45 PM"],
    places: ["Mountain View", "Outdoor"],
    people: ["Emma, Noah, Liam, Sophia"],
    link: "",
    startTime: ["09:00", "AM"],
    endTime: ["05:00", "PM"],
    eventType: {
      text: "New",
      color: "#219B9D",
    },
    background: "#DFFFD6",
  },
  {
    id: "1730490420003",
    task: "Client Demo Presentation",
    description: "Showcase the finalized product to the client.",
    date: "2024-12-22",
    createdOn: ["2024-12-01", "04:00 PM"],
    places: ["London", "Virtual"],
    people: ["Client Team, Design Team"],
    link: "https://meeting-link.com/demo",
    startTime: ["02:00", "PM"],
    endTime: ["03:00", "PM"],
    eventType: {
      text: "Upcoming",
      color: "#006BFF",
    },
    background: "#D8EAFE",
  },
  {
    id: "1730490420004",
    task: "Code Review Session",
    description: "Review the latest changes in the codebase.",
    date: "2024-12-18",
    createdOn: ["2024-12-12", "11:15 AM"],
    places: ["Remote"],
    people: ["Development Team"],
    link: "",
    startTime: ["04:30", "PM"],
    endTime: ["06:00", "PM"],
    eventType: {
      text: "Pending",
      color: "#5deb6f",
    },
    background: "#ffb7b77d",
  },
  {
    id: "1730490420005",
    task: "Quarterly Business Review",
    description: "Analyze and discuss the company's performance.",
    date: "2024-12-30",
    createdOn: ["2024-12-20", "03:00 PM"],
    places: ["Dubai"],
    people: ["Executive Team"],
    link: "",
    startTime: ["11:00", "AM"],
    endTime: ["01:00", "PM"],
    eventType: {
      text: "Cancelled",
      color: "#FF4545",
    },
    background: "#ffb7b77d",
  },
]);