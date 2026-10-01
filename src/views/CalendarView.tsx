import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import type { Appointment, Service } from "@/types/appointment";

interface CalendarViewProps {
  appointments: Appointment[];
  services: Service[];
  onNewAppointmentClick: () => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

export function CalendarView(props: CalendarViewProps) {
  return <AppointmentCalendar {...props} />;
}
