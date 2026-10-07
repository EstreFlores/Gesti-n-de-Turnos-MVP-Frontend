import { Scissors, User, Phone } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { PROFESSIONALS } from "@/features/appointments/data/professionals";
import type { AppointmentFormInput } from "@/features/appointments/schemas/appointmentSchema";
import type { Service } from "@/types/appointment";

interface AppointmentClientFieldsProps {
  register: UseFormRegister<AppointmentFormInput>;
  errors: FieldErrors<AppointmentFormInput>;
  services: Service[];
  professionalId: string;
  onProfessionalChange: (professionalId: string) => void;
}

export function AppointmentClientFields({
  register,
  errors,
  services,
  professionalId,
  onProfessionalChange,
}: AppointmentClientFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-700">Nombre del Cliente *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User size={15} /></span>
            <input
              type="text"
              {...register("clientName")}
              placeholder="Ej. María Fernanda Gómez"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {errors.clientName && <span className="mt-1 block text-[11px] font-medium text-rose-500">{String(errors.clientName.message)}</span>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-700">WhatsApp / Teléfono *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Phone size={15} /></span>
            <input
              type="text"
              {...register("clientPhone")}
              placeholder="+52 312 456 7890"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {errors.clientPhone && <span className="mt-1 block text-[11px] font-medium text-rose-500">{String(errors.clientPhone.message)}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-700">Tratamiento o Servicio *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Scissors size={15} /></span>
            <select
              {...register("serviceId")}
              className="w-full truncate appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} (${service.price} - {service.durationMinutes} min)
                </option>
              ))}
            </select>
          </div>
          {errors.serviceId && <span className="mt-1 block text-[11px] font-medium text-rose-500">{String(errors.serviceId.message)}</span>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-700">Profesional Asignado *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User size={15} /></span>
            <select
              value={professionalId}
              onChange={(event) => onProfessionalChange(event.target.value)}
              className="w-full truncate appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {PROFESSIONALS.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {professional.name} ({professional.specialty})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
