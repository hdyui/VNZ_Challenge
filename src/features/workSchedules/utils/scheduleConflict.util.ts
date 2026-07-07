import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import type { ScheduleView } from "../type";

export function getScheduleDateRange(view: ScheduleView, date: Date) {
  const fmt = (d: Date) => format(d, "yyyy-MM-dd");

  switch (view) {
    case "day":
      return { fromDate: fmt(date), toDate: fmt(date) };
    case "week":
      return {
        fromDate: fmt(startOfWeek(date, { weekStartsOn: 1 })),
        toDate: fmt(endOfWeek(date, { weekStartsOn: 1 })),
      };
    case "month":
      return {
        fromDate: fmt(startOfMonth(date)),
        toDate: fmt(endOfMonth(date)),
      };
    case "year":
      return {
        fromDate: fmt(startOfYear(date)),
        toDate: fmt(endOfYear(date)),
      };
  }
}
