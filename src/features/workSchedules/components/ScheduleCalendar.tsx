// Cần cài: npm install react-big-calendar date-fns
// CSS gốc của react-big-calendar cần được import 1 lần ở App.tsx hoặc file entry:
//   import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMemo } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  type View,
  Views,
} from "react-big-calendar";

import { vi } from "date-fns/locale";
import type { ScheduleView, WorkSchedule } from "../type";
import { format, getDay, parse, startOfWeek } from "date-fns";

const locales = { vi };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: vi }),
  getDay,
  locales,
});

const STATUS_COLOR: Record<string, string> = {
  Working: "#2563eb",
  Off: "#9ca3af",
  Absent: "#dc2626",
  Completed: "#16a34a",
};

interface ScheduleCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: WorkSchedule;
}

interface ScheduleCalendarProps {
  schedules: WorkSchedule[];
  view: ScheduleView;
  date: Date;
  onNavigate: (date: Date) => void;
  onSelectEvent: (schedule: WorkSchedule) => void;
}

const VIEW_MAP: Record<ScheduleView, View> = {
  day: Views.DAY,
  week: Views.WEEK,
  month: Views.MONTH,
  year: Views.MONTH, // react-big-calendar không có "year" view sẵn, fallback về month
};

function toDateTime(workDate: string, time: string): Date {
  return new Date(`${workDate}T${time}`);
}

export default function ScheduleCalendar({
  schedules,
  view,
  date,
  onNavigate,
  onSelectEvent,
}: ScheduleCalendarProps) {
  const events: ScheduleCalendarEvent[] = useMemo(
    () =>
      schedules.map((s) => ({
        id: s.id,
        title: `${s.employeeName} — ${s.shiftName ?? "Ca linh hoạt"}`,
        start: toDateTime(s.workDate, s.startTime),
        end: toDateTime(s.workDate, s.endTime),
        resource: s,
      })),
    [schedules],
  );

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-3"
      style={{ height: 650 }}
    >
      <Calendar
        localizer={localizer}
        events={events}
        date={date}
        view={VIEW_MAP[view]}
        onNavigate={onNavigate}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        onSelectEvent={(event) => onSelectEvent(event.resource)}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: STATUS_COLOR[event.resource.status] ?? "#2563eb",
            borderRadius: 6,
            border: "none",
            fontSize: 12,
          },
        })}
        messages={{
          today: "Hôm nay",
          previous: "Trước",
          next: "Sau",
          month: "Tháng",
          week: "Tuần",
          day: "Ngày",
          agenda: "Danh sách",
          noEventsInRange: "Không có lịch làm việc trong khoảng này.",
        }}
      />
    </div>
  );
}
