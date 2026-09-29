import { Clock } from "lucide-react";
import { PROFESSIONALS } from "@/features/appointments/data/professionals";
import { getProfessionalId } from "@/components/calendar/calendarUtils";
import type { Appointment, Service } from "@/types/appointment";

interface CalendarDayViewProps {
  appointments: Appointment[];
  services: Service[];
  timeSlots: string[];
  onSelectAppointment: (appointment: Appointment) => void;
}

export function CalendarDayView({
  appointments,
  services,
  timeSlots,
  onSelectAppointment,
}: CalendarDayViewProps) {
  const getServiceName = (serviceId: string) =>
    services.find((service) => service.id === serviceId)?.name ?? "Servicio";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="grid grid-cols-5 border-b border-slate-100 bg-slate-50/70 text-center">
        <div className="flex items-center justify-center gap-1 border-r border-slate-100 p-3 text-xs font-bold uppercase text-slate-400">
          <Clock size={14} /> Hora
        </div>
        {PROFESSIONALS.map((professional) => (
          <div key={professional.id} className="border-r border-slate-100 p-3 last:border-r-0">
            <div className="truncate text-xs font-bold text-slate-800">{professional.name}</div>
            <div className="truncate text-[10px] text-slate-400">{professional.specialty}</div>
          </div>
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {timeSlots.map((time) => (
          <div key={time} className="grid min-h-[70px] grid-cols-5">
            <div className="flex items-start justify-center border-r border-slate-100 bg-slate-50/30 p-3 text-xs font-semibold text-slate-400">
              {time}
            </div>
            {PROFESSIONALS.map((professional) => {
              const slotAppointments = appointments.filter(
                (appointment) =>
                  appointment.startTime === time &&
                  getProfessionalId(appointment) === professional.id
              );
              return (
                <div
                  key={professional.id}
                  className="group relative border-r border-slate-100 p-2 last:border-r-0"
                >
                  {slotAppointments.length ? (
                    <div className="space-y-2">
                      {slotAppointments.map((appointment) => (
                        <button
                          type="button"
                          key={appointment.id}
                          onClick={() => onSelectAppointment(appointment)}
                          className="w-full cursor-pointer rounded-xl border border-rose-200 bg-rose-50/90 p-2.5 text-left shadow-sm transition hover:border-primary/50 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between">
                            <span className="truncate text-xs font-bold text-slate-900">{appointment.clientName}</span>
                            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-medium uppercase text-white">{appointment.status}</span>
                          </div>
                          <p className="mt-0.5 truncate text-[11px] font-medium text-primary">{getServiceName(appointment.serviceId)}</p>
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock size={10} /> {appointment.startTime} ({appointment.durationMinutes}m)
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center opacity-0 transition group-hover:opacity-100">
                      <span className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] text-slate-400">
                        Disponible
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
