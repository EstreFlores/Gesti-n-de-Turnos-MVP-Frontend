import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment, Service } from "@/types/appointment";
import { CalendarDayView } from "@/components/calendar/CalendarDayView";
import { CalendarMonthView } from "@/components/calendar/CalendarMonthView";
import { CalendarToolbar } from "@/components/calendar/CalendarToolbar";
import { CalendarWeekView } from "@/components/calendar/CalendarWeekView";
import { getTimeSlots, getWeekDays, toDateKey, type CalendarViewMode } from "@/components/calendar/calendarUtils";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  services: Service[];
  onNewAppointmentClick: () => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

export function AppointmentCalendar({
  appointments,
  services,
  onNewAppointmentClick,
  onSelectAppointment,
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
  const [viewMode, setViewMode] = useState<CalendarViewMode>("day");
  const [statusFilter, setStatusFilter] = useState("all");

  const weekDays = useMemo(
    () => getWeekDays(new Date(`${selectedDate}T00:00:00`)),
    [selectedDate]
  );
  const monthDays = useMemo(() => {
    const date = new Date(`${selectedDate}T00:00:00`);
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
    });
  }, [selectedDate]);

  const dayAppointments = useMemo(
    () => appointments.filter((appointment) =>
      appointment.date === selectedDate &&
      (statusFilter === "all" || appointment.status === statusFilter)
    ),
    [appointments, selectedDate, statusFilter]
  );
  const weekAppointments = useMemo(
    () => appointments.filter((appointment) =>
      weekDays.includes(appointment.date) &&
      (statusFilter === "all" || appointment.status === statusFilter)
    ),
    [appointments, weekDays, statusFilter]
  );
  const monthAppointments = useMemo(() => {
    const visibleDates = new Set(monthDays.map(toDateKey));
    return appointments.filter((appointment) =>
      visibleDates.has(appointment.date) &&
      (statusFilter === "all" || appointment.status === statusFilter)
    );
  }, [appointments, monthDays, statusFilter]);

  const statusCounts = useMemo(() => {
    const visibleAppointments = viewMode === "day"
      ? appointments.filter((appointment) => appointment.date === selectedDate)
      : viewMode === "week"
        ? appointments.filter((appointment) => weekDays.includes(appointment.date))
        : appointments.filter((appointment) => monthDays.some((day) => toDateKey(day) === appointment.date));
    return {
      pending: visibleAppointments.filter((appointment) => appointment.status === "pending").length,
      confirmed: visibleAppointments.filter((appointment) => appointment.status === "confirmed").length,
      completed: visibleAppointments.filter((appointment) => appointment.status === "completed").length,
    };
  }, [appointments, viewMode, selectedDate, weekDays, monthDays]);

  const dateTitle = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${selectedDate}T00:00:00`));
  const weekStart = new Date(`${weekDays[0]}T00:00:00`);
  const weekEnd = new Date(`${weekDays[6]}T00:00:00`);
  const weekTitle = `${weekStart.getDate()} - ${weekEnd.getDate()} de ${
    new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(weekEnd)
  }`;
  const monthTitle = format(new Date(`${selectedDate}T00:00:00`), "MMMM yyyy", { locale: es });

  const changePeriod = (direction: -1 | 1) => {
    const date = new Date(`${selectedDate}T00:00:00`);
    if (viewMode === "month") {
      setSelectedDate(toDateKey(direction < 0 ? subMonths(date, 1) : addMonths(date, 1)));
      return;
    }
    date.setDate(date.getDate() + direction * (viewMode === "week" ? 7 : 1));
    setSelectedDate(toDateKey(date));
  };

  return (
    <div className="space-y-6">
      <CalendarToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusCounts={statusCounts}
        dateTitle={dateTitle}
        weekTitle={weekTitle}
        monthTitle={monthTitle}
        onPrevious={() => changePeriod(-1)}
        onToday={() => setSelectedDate(toDateKey(new Date()))}
        onNext={() => changePeriod(1)}
        onNewAppointment={onNewAppointmentClick}
      />
      {viewMode === "day" && (
        <CalendarDayView
          appointments={dayAppointments}
          services={services}
          timeSlots={getTimeSlots(dayAppointments)}
          onSelectAppointment={onSelectAppointment}
        />
      )}
      {viewMode === "week" && (
        <CalendarWeekView
          appointments={weekAppointments}
          services={services}
          days={weekDays}
          timeSlots={getTimeSlots(weekAppointments)}
          onSelectAppointment={onSelectAppointment}
        />
      )}
      {viewMode === "month" && (
        <CalendarMonthView
          appointments={monthAppointments}
          services={services}
          days={monthDays}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setViewMode("day");
          }}
          onSelectAppointment={onSelectAppointment}
        />
      )}
    </div>
  );
}
