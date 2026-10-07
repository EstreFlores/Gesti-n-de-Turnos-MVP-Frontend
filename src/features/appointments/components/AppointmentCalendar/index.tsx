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
import { CalendarDayView } from "@/features/appointments/components/AppointmentCalendar/CalendarDayView";
import { CalendarMonthView } from "@/features/appointments/components/AppointmentCalendar/CalendarMonthView";
import { CalendarToolbar } from "@/features/appointments/components/AppointmentCalendar/CalendarToolbar";
import { CalendarWeekView } from "@/features/appointments/components/AppointmentCalendar/CalendarWeekView";
import { getTimeSlots, getWeekDays, toDateKey, type CalendarViewMode } from "@/features/appointments/components/AppointmentCalendar/calendarUtils";

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

  const appointmentsByDate = useMemo(() => {
    const grouped = new Map<string, Appointment[]>();
    appointments.forEach((appointment) => {
      const dayAppointments = grouped.get(appointment.date) ?? [];
      dayAppointments.push(appointment);
      grouped.set(appointment.date, dayAppointments);
    });
    return grouped;
  }, [appointments]);

  const dayAppointments = useMemo(
    () => (appointmentsByDate.get(selectedDate) ?? []).filter(
      (appointment) => statusFilter === "all" || appointment.status === statusFilter
    ),
    [appointmentsByDate, selectedDate, statusFilter]
  );
  const weekAppointments = useMemo(
    () => weekDays.flatMap((day) => appointmentsByDate.get(day) ?? [])
      .filter((appointment) => statusFilter === "all" || appointment.status === statusFilter),
    [appointmentsByDate, weekDays, statusFilter]
  );
  const statusCounts = useMemo(() => {
    const visibleDates = viewMode === "day"
      ? [selectedDate]
      : viewMode === "week"
        ? weekDays
        : monthDays.map(toDateKey);
    return visibleDates
      .flatMap((day) => appointmentsByDate.get(day) ?? [])
      .reduce(
        (counts, appointment) => {
          if (appointment.status === "pending") counts.pending += 1;
          if (appointment.status === "confirmed") counts.confirmed += 1;
          if (appointment.status === "completed") counts.completed += 1;
          return counts;
        },
        { pending: 0, confirmed: 0, completed: 0 }
      );
  }, [appointmentsByDate, viewMode, selectedDate, weekDays, monthDays]);

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
          appointmentsByDate={appointmentsByDate}
          statusFilter={statusFilter}
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
