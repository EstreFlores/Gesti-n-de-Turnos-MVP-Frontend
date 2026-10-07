import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toastManager";
import { appointmentService } from "@/features/appointments/api/appointmentService";
import type { Appointment, Service } from "@/types/appointment";

const APPOINTMENTS_QUERY_KEY = ["appointments"] as const;
const SERVICES_QUERY_KEY = ["services"] as const;
const EMPTY_APPOINTMENTS: Appointment[] = [];
const EMPTY_SERVICES: Service[] = [];

export function useAppointments() {
  const queryClient = useQueryClient();
  const appointmentsQuery = useQuery({
    queryKey: APPOINTMENTS_QUERY_KEY,
    queryFn: appointmentService.getAppointments,
  });
  const servicesQuery = useQuery({
    queryKey: SERVICES_QUERY_KEY,
    queryFn: appointmentService.getServices,
  });

  const createMutation = useMutation({
    mutationFn: (appointment: Appointment) =>
      appointmentService.createAppointment({
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        serviceId: appointment.serviceId,
        durationMinutes: appointment.durationMinutes,
        professionalId: appointment.professionalId,
        date: appointment.date,
        startTime: appointment.startTime,
        status: appointment.status,
        notes: appointment.notes,
      }),
    onMutate: async (appointment) => {
      await queryClient.cancelQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      const previousAppointments = queryClient.getQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY);
      queryClient.setQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY, (current) => [
        ...(current ?? []),
        appointment,
      ]);
      return { previousAppointments };
    },
    onSuccess: (createdAppointment, optimisticAppointment) => {
      queryClient.setQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY, (current) =>
        current?.map((appointment) =>
          appointment.id === optimisticAppointment.id ? createdAppointment : appointment
        )
      );
      toast.add({
        title: "Cita creada",
        description: "La cita se registró correctamente.",
        type: "success",
      });
    },
    onError: (error, _appointment, context) => {
      console.error("Error al crear la cita:", error);
      if (context?.previousAppointments) {
        queryClient.setQueryData(APPOINTMENTS_QUERY_KEY, context.previousAppointments);
      }
      toast.add({
        title: "No se pudo crear la cita",
        description: "Ocurrió un error al comunicarse con la API.",
        type: "error",
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: (appointment: Appointment) =>
      appointmentService.updateAppointment(appointment.id, {
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        serviceId: appointment.serviceId,
        professionalId: appointment.professionalId,
        date: appointment.date,
        startTime: appointment.startTime,
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
        notes: appointment.notes,
      }),
    onMutate: async (nextAppointment) => {
      await queryClient.cancelQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      const previousAppointments = queryClient.getQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY);
      queryClient.setQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY, (current) =>
        current?.map((appointment) =>
          appointment.id === nextAppointment.id ? nextAppointment : appointment
        )
      );
      return { previousAppointments };
    },
    onSuccess: (updatedAppointment) => {
      queryClient.setQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY, (current) =>
        current?.map((appointment) =>
          appointment.id === updatedAppointment.id ? updatedAppointment : appointment
        )
      );
      toast.add({
        title: "Cita actualizada",
        description: "Los datos de la cita se actualizaron correctamente.",
        type: "success",
      });
    },
    onError: (error, _appointment, context) => {
      console.error("Error al actualizar la cita:", error);
      if (context?.previousAppointments) {
        queryClient.setQueryData(APPOINTMENTS_QUERY_KEY, context.previousAppointments);
      }
      toast.add({
        title: "No se pudo actualizar la cita",
        description: "Los datos se restauraron porque ocurrió un error al guardar.",
        type: "error",
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Appointment["status"] }) =>
      appointmentService.updateAppointmentStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      const previousAppointments = queryClient.getQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY);
      queryClient.setQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY, (current) =>
        current?.map((appointment) =>
          appointment.id === id
            ? { ...appointment, status, updatedAt: new Date().toISOString() }
            : appointment
        )
      );
      return { previousAppointments };
    },
    onSuccess: (updatedAppointment) => {
      queryClient.setQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY, (current) =>
        current?.map((appointment) =>
          appointment.id === updatedAppointment.id ? updatedAppointment : appointment
        )
      );
      toast.add({
        title: "Estado actualizado",
        description: `La cita de ${updatedAppointment.clientName} ahora está ${updatedAppointment.status === "confirmed" ? "confirmada" : updatedAppointment.status === "completed" ? "completada" : "cancelada"}.`,
        type: "success",
      });
    },
    onError: (error, _variables, context) => {
      console.error("Error al actualizar el estado:", error);
      if (context?.previousAppointments) {
        queryClient.setQueryData(APPOINTMENTS_QUERY_KEY, context.previousAppointments);
      }
      toast.add({
        title: "No se pudo actualizar el estado",
        description: "La cita volvió a su estado anterior porque ocurrió un error.",
        type: "error",
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (appointment: Appointment) =>
      appointmentService.deleteAppointment(appointment.id),
    onMutate: async (appointment) => {
      await queryClient.cancelQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      const previousAppointments = queryClient.getQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY);
      queryClient.setQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY, (current) =>
        current?.filter((item) => item.id !== appointment.id)
      );
      return { previousAppointments };
    },
    onSuccess: (_result, appointment) => {
      toast.add({
        title: "Cita eliminada",
        description: `La cita de ${appointment.clientName} se eliminó correctamente.`,
        type: "success",
      });
    },
    onError: (error, _appointment, context) => {
      console.error("Error al eliminar la cita:", error);
      if (context?.previousAppointments) {
        queryClient.setQueryData(APPOINTMENTS_QUERY_KEY, context.previousAppointments);
      }
      toast.add({
        title: "No se pudo eliminar la cita",
        description: "La cita volvió a aparecer porque ocurrió un error al eliminarla.",
        type: "error",
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
  });

  return {
    appointments: appointmentsQuery.data ?? EMPTY_APPOINTMENTS,
    services: servicesQuery.data ?? EMPTY_SERVICES,
    loading: appointmentsQuery.isLoading || servicesQuery.isLoading,
    loadError:
      (appointmentsQuery.isError && !appointmentsQuery.data) ||
      (servicesQuery.isError && !servicesQuery.data),
    retry: () => {
      void Promise.all([appointmentsQuery.refetch(), servicesQuery.refetch()]);
    },
    create: (appointment: Appointment) => createMutation.mutate(appointment),
    update: (appointment: Appointment) => updateMutation.mutate(appointment),
    updateStatus: (id: string, status: Appointment["status"]) =>
      updateStatusMutation.mutate({ id, status }),
    remove: (appointment: Appointment) => deleteMutation.mutate(appointment),
  };
}
