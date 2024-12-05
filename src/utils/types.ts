export interface Events {
  id: string;
  task: string;
  description: string;
  link: string;
  date: string;
  startTime: string[];
  endTime: string[];
  createdOn: string[];
  places: string[];
  people: string[];
  eventType: OptionType;
  background: bgColor;
}

export type bgColor =
  | "#D8EAFE"
  | "#FFF8D8"
  | "#DFFFD6"
  | "#ffb7b77d"
  | "#ffffff"
  | "#d8d8d8"
  | "#decdfb";

export type OptionType =
  | { text: "Upcoming"; color: "#006BFF" }
  | { text: "Pending"; color: "#5deb6f" }
  | { text: "New"; color: "#219B9D" }
  | { text: "Cancelled"; color: "#FF4545" };

export const IdFormat = "YYYY-MM-DD#hh_A";
