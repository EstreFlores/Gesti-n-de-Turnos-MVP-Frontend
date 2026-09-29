import { Clock } from "lucide-react";
import { toDateKey } from "@/components/calendar/calendarUtils";
import type { Appointment, Service } from "@/types/appointment";

interface CalendarWeekViewProps {
  appointments: Appointment[];
  services: Service[];
  days: string[];
  timeSlots: string[];
  onSelectAppointment: (appointment: Appointment) => void;
}

export function CalendarWeekView({
  appointments,
  services,
  days,
  timeSlots,
  onSelectAppointment,
}: CalendarWeekViewProps) {
  const getServiceName = (serviceId: string) =>
    services.find((service) => service.id === serviceId)?.name ?? "Servicio";

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="grid gap-px" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
        <div className="sticky left-0 z-10 flex items-center justify-center gap-1 border-b border-slate-100 bg-slate-50/70 p-3 text-xs font-bold uppercase text-slate-400">
          <Clock size={14} /> Hora
        </div>
        {days.map((day) => {
          const date = new Date(`${day}T00:00:00`);
          const isToday = day === toDateKey(new Date());
          return (
            <div
              key={day}
              className={`border-b border-slate-100 p-3 text-center text-xs font-bold ${
                isToday ? "border-b-2 border-primary bg-primary/10" : "bg-slate-50/70"
              }`}
            >
              <div className={isToday ? "text-primary" : "text-slate-600"}>
                {new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(date).toUpperCase()}
              </div>
              <div className={`text-sm font-extrabold ${isToday ? "text-primary" : "text-slate-900"}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
        {timeSlots.map((time) => (
          <div key={time} className="contents">
            <div className="sticky left-0 z-10 flex min-h-[90px] items-center justify-center border-b border-slate-100 bg-slate-50/30 p-3 text-xs font-semibold text-slate-400">
              {time}
            </div>
            {days.map((day) => {
              const slotAppointments = appointments.filter(
                (appointment) => appointment.date === day && appointment.startTime === time
              );
              return (
                <div
                  key={`${day}-${time}`}
                  className="group relative flex min-h-22.5 items-center border-b border-slate-100 p-2"
                >
                  {slotAppointments.length ? (
                    <div className="w-full space-y-2">
                      {slotAppointments.map((appointment) => (
                        <button
                          type="button"
                          key={appointment.id}
                          onClick={() => onSelectAppointment(appointment)}
                          className="w-full cursor-pointer rounded-xl border border-rose-200 bg-rose-50/90 p-2 text-left shadow-sm transition hover:border-primary/50 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="flex-1 truncate text-xs font-bold text-slate-900">{appointment.clientName}</span>
                            <span className="whitespace-nowrap rounded-full bg-primary px-1 py-0.5 text-[8px] font-medium uppercase text-white">{appointment.status}</span>
                          </div>
                          <p className="mt-0.5 truncate text-[10px] font-medium text-primary">{getServiceName(appointment.serviceId)}</p>
                          <div className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-400">
                            <Clock size={9} /> {appointment.startTime}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center opacity-0 transition group-hover:opacity-100">
                      <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-400">
                        Libre
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
