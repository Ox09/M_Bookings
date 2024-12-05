import dayjs from "dayjs";
import { IdFormat } from "./types";

export function getRandomColor(colors: string[]) {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

const colors = ["#FF8A66", "#66FF8A", "#668AFF", "#F7FF66", "#FF66F8"];
export const randomColor = getRandomColor(colors);

export function createID(date: string, eventStartTime?: string[]) {
  if (eventStartTime && eventStartTime?.length > 0) {
    return dayjs(`${date} ${eventStartTime?.join(" ")}`).format(IdFormat);
  } else {
    return dayjs(date).format("YYYY-MM-DD");
  }
}

export function createDateAndTimeFromId(id: string | null) {
  if (!id) {
    return { date: "", formattedTime: "" };
  }
  const [date, time] = id.split("#");
  let formattedTime: string;
  if (time) {
    const [hour, period] = time.split("_");
    formattedTime = `${hour}:00 ${period}`;
  } else {
    const [hour, period] = [dayjs().format("hh"), dayjs().format("A")];
    formattedTime = `${hour}:00 ${period}`;
  }
  return { date, formattedTime };
}

// Might be unused
export function createKeyFromWeekDay(
  year: string,
  monthIndex: number,
  totalWeeks: Record<number, Record<string, number>>,
  activeWeek: number,
  day: number,
  modifiedHour: string
) {
  return `${year}-${monthIndex + 1}-${String(
    totalWeeks[activeWeek]?.[day]
  ).padStart(2, "0")}#${modifiedHour}`;
}
