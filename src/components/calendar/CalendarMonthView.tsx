import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment, Service } from "@/types/appointment";
import { toDateKey } from "@/components/calendar/calendarUtils";

interface CalendarMonthViewProps {
  appointments: Appointment[];
  services: Service[];
  days: Date[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

export function CalendarMonthView({
  appointments,
  services,
  days,
  selectedDate,
  onSelectDate,
  onSelectAppointment,
}: CalendarMonthViewProps) {
  const getServiceName = (serviceId: string) =>
    services.find((service) => service.id === serviceId)?.name ?? "Servicio";
  const currentMonth = new Date(`${selectedDate}T00:00:00`).getMonth();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((weekday) => (
          <div key={weekday} className="p-2 text-center text-xs font-bold uppercase text-slate-500 sm:p-3">
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayKey = toDateKey(day);
          const dayAppointments = appointments
            .filter((appointment) => appointment.date === dayKey)
            .sort((first, second) => first.startTime.localeCompare(second.startTime));
          const isCurrentMonth = day.getMonth() === currentMonth;
          const isToday = dayKey === toDateKey(new Date());
          return (
            <div
              key={dayKey}
              className={`min-h-28 border-b border-r border-slate-100 p-1.5 sm:min-h-36 sm:p-2 ${
                isCurrentMonth ? "bg-white" : "bg-slate-50/70"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectDate(dayKey)}
                aria-label={`Ver citas del ${format(day, "d 'de' MMMM", { locale: es })}`}
                className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  isToday
                    ? "bg-primary text-white"
                    : isCurrentMonth
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-slate-400 hover:bg-slate-200"
                }`}
              >
                {day.getDate()}
              </button>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <button
                    type="button"
                    key={appointment.id}
                    onClick={() => onSelectAppointment(appointment)}
                    title={`${appointment.startTime} · ${appointment.clientName} · ${getServiceName(appointment.serviceId)}`}
                    className="block w-full truncate rounded-md border border-rose-200 bg-rose-50 px-1.5 py-1 text-left text-[10px] leading-tight text-rose-900 transition hover:border-primary/50 sm:text-xs"
                  >
                    <span className="font-semibold">{appointment.startTime}</span>{" "}
                    <span>{appointment.clientName}</span>
                  </button>
                ))}
                {dayAppointments.length > 3 && (
                  <button
                    type="button"
                    onClick={() => onSelectDate(dayKey)}
                    className="px-1 text-[10px] font-semibold text-primary hover:underline"
                  >
                    +{dayAppointments.length - 3} más
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
