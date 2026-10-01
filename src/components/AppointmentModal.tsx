import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Appointment, Service } from "@/types/appointment";
import { PROFESSIONALS } from "@/features/appointments/data/professionals";
import { appointmentFormSchema, type AppointmentFormValues } from "@/features/appointments/schemas/appointmentSchema";
import { toast } from "@/components/ui/toast";
import { X, Calendar } from "lucide-react";
import { AppointmentClientFields } from "@/components/AppointmentClientFields";
import { AppointmentScheduleFields } from "@/components/AppointmentScheduleFields";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  existingAppointments: Appointment[];
  appointmentToEdit?: Appointment | null;
  onSaveAppointment: (
    nextAppointment: Appointment,
    previousAppointment: Appointment | null
  ) => void;
}

export function AppointmentModal({ 
  isOpen, 
  onClose, 
  services, 
  existingAppointments, 
  appointmentToEdit,
  onSaveAppointment,
}: AppointmentModalProps) {
  const [professionalId, setProfessionalId] = useState(PROFESSIONALS[0].id);

  
  const {register, handleSubmit, watch, setValue, reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      status: "pending",
      durationMinutes: 45,
      clientName: "",
      clientPhone: "",
      serviceId: services[0]?.id || "",
      date: "",
      startTime: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (appointmentToEdit) {
      setProfessionalId(appointmentToEdit.professionalId || PROFESSIONALS[0].id);
      reset({
        clientName: appointmentToEdit.clientName,
        clientPhone: appointmentToEdit.clientPhone || "",
        serviceId: appointmentToEdit.serviceId,
        date: appointmentToEdit.date,
        startTime: appointmentToEdit.startTime,
        durationMinutes: appointmentToEdit.durationMinutes,
        notes: appointmentToEdit.notes || "",
        status: appointmentToEdit.status,
      });
    } else {
      setProfessionalId(PROFESSIONALS[0].id);
      reset({
        status: "pending",
        durationMinutes: services[0]?.durationMinutes || 45,
        clientName: "",
        clientPhone: "",
        serviceId: services[0]?.id || "",
        date: "",
        startTime: "",
        notes: "",
      });
    }
  }, [isOpen, appointmentToEdit, reset, services]);

  const watchedServiceId = watch("serviceId");
  const watchedDate = watch("date");
  const watchedStartTime = watch("startTime");

  useEffect(() => {
    const selected = services.find((s) => s.id === watchedServiceId);
    if (selected) {
      setValue("durationMinutes", selected.durationMinutes);
    } else if (services.length > 0) {
      setValue("serviceId", services[0].id);
      setValue("durationMinutes", services[0].durationMinutes);
    }
  }, [watchedServiceId, services, setValue]);

  const durationMinutes = Number(watch("durationMinutes")) || 45;

  const endTime = useMemo(() => {
    if (!watchedStartTime) return "--:--";
    const [hours, minutes] = watchedStartTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
  }, [watchedStartTime, durationMinutes]);

  const overlapConflict = useMemo(() => {
    if (!watchedDate || !watchedStartTime) return null;

    const [startH, startM] = watchedStartTime.split(":").map(Number);
    const newStartTotal = startH * 60 + startM;
    const newEndTotal = newStartTotal + durationMinutes;

    return existingAppointments.find((apt) => {
      if (apt.id === appointmentToEdit?.id) return false;
      if (apt.date !== watchedDate) return false;
      if (apt.status === "cancelled") return false;
      if ((apt.professionalId || PROFESSIONALS[0].id) !== professionalId) return false;
      
      const [aptH, aptM] = apt.startTime.split(":").map(Number);
      const aptStartTotal = aptH * 60 + aptM;
      const aptEndTotal = aptStartTotal + apt.durationMinutes;

      return newStartTotal < aptEndTotal && newEndTotal > aptStartTotal;
    });
  }, [watchedDate, watchedStartTime, durationMinutes, existingAppointments, appointmentToEdit, professionalId]);

  if (!isOpen) return null;

  const onSubmit = (data: AppointmentFormValues) => {
    if (overlapConflict) {
      toast.add({
        title: "Horario no disponible",
        description: "No se puede guardar la cita debido a un solapamiento.",
        type: "error",
      });
      return;
    }

    const optimisticId = appointmentToEdit?.id ?? `optimistic-${crypto.randomUUID()}`;
    const optimisticAppointment: Appointment = {
      ...(appointmentToEdit ?? {
        id: optimisticId,
        createdAt: new Date().toISOString(),
      }),
      ...data,
      durationMinutes,
      professionalId,
      notes: data.notes?.trim() || "",
      id: optimisticId,
      updatedAt: new Date().toISOString(),
    };

    onSaveAppointment(optimisticAppointment, appointmentToEdit ?? null);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-primary flex items-center justify-center font-bold shadow-sm">
              <Calendar size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {appointmentToEdit ? "Editar Cita" : "Nueva Cita"}
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Ingresa los datos del turno. El motor valida solapamientos en tiempo real.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <AppointmentClientFields
            register={register}
            errors={errors}
            services={services}
            professionalId={professionalId}
            onProfessionalChange={setProfessionalId}
          />

          <AppointmentScheduleFields
            register={register}
            errors={errors}
            durationMinutes={durationMinutes}
            endTime={endTime}
            watchedDate={watchedDate}
            watchedStartTime={watchedStartTime}
            overlapConflict={overlapConflict}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Notas clínicas y preferencias <span className="text-slate-400 font-normal lowercase">(Opcional)</span>
            </label>
            <textarea 
              rows={2}
              {...register("notes")}
              placeholder="Ej. Prefiere esmalte semipermanente tono nude..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              Usa <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-slate-600 font-mono">Esc</kbd> para salir
            </span>
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={Boolean(overlapConflict)}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-rose-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {appointmentToEdit ? "Guardar Cambios" : "Confirmar y Guardar Turno"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}