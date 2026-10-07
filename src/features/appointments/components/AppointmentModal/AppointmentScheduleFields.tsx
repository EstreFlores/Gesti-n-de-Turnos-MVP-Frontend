import { AlertCircle, Calendar, CheckCircle2, Clock } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { Appointment } from "@/types/appointment";
import type { AppointmentFormInput } from "@/features/appointments/schemas/appointmentSchema";

interface AppointmentScheduleFieldsProps {
  register: UseFormRegister<AppointmentFormInput>;
  errors: FieldErrors<AppointmentFormInput>;
  durationMinutes: number;
  endTime: string;
  watchedDate: string;
  watchedStartTime: string;
  overlapConflict: Appointment | null | undefined;
}

export function AppointmentScheduleFields({
  register,
  errors,
  durationMinutes,
  endTime,
  watchedDate,
  watchedStartTime,
  overlapConflict,
}: AppointmentScheduleFieldsProps) {
  return (
    <>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase text-slate-700">Estado de la cita *</label>
        <select
          {...register("status")}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmada</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>
        {errors.status && <span className="mt-1 block text-[11px] font-medium text-rose-500">{String(errors.status.message)}</span>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-700">Fecha de Cita *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Calendar size={15} /></span>
            <input
              type="date"
              {...register("date")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-2 text-xs transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {errors.date && <span className="mt-1 block text-[11px] font-medium text-rose-500">{String(errors.date.message)}</span>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-700">Hora Inicio *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Clock size={15} /></span>
            <input
              type="time"
              {...register("startTime")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-2 text-xs transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {errors.startTime && <span className="mt-1 block text-[11px] font-medium text-rose-500">{String(errors.startTime.message)}</span>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-700">Duración Estimada</label>
          <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-2 text-xs font-medium text-slate-700">
            <span className="flex items-center gap-1 text-primary"><Clock size={14} /> {durationMinutes} min</span>
            <span className="text-slate-400">Fin: {endTime}</span>
          </div>
        </div>
      </div>

      {watchedDate && watchedStartTime && (
        <div>
          {overlapConflict ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
              <div>
                <span className="block font-bold">¡Conflicto de horario detectado!</span>
                Ya existe una cita programada con <span className="font-semibold">{overlapConflict.clientName}</span> a las {overlapConflict.startTime}.
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-900">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              <div>
                <span className="block font-bold">Horario disponible sin solapamientos</span>
                El especialista y la cabina se encuentran libres de {watchedStartTime} a {endTime}.
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
