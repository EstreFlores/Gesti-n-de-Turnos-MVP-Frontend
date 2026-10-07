import { PROFESSIONALS } from "@/features/appointments/data/professionals";
import type { Appointment } from "@/types/appointment";

export type CalendarViewMode = "day" | "week" | "month";

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const getTimeSlots = (appointments: Appointment[]) =>
  [...new Set([...HOURS, ...appointments.map((appointment) => appointment.startTime)])].sort();

export const getProfessionalId = (appointment: Appointment) =>
  appointment.professionalId || PROFESSIONALS[0].id;

export const getWeekDays = (date: Date): string[] => {
  const monday = new Date(date);
  const weekday = monday.getDay();
  monday.setDate(monday.getDate() - weekday + (weekday === 0 ? -6 : 1));

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return toDateKey(day);
  });
};
