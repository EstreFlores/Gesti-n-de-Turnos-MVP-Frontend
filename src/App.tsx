import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "@/features/appointments/api/appointmentService";
import type { Appointment, Service } from "@/types/appointment";
import { AppointmentTable } from "@/components/AppointmentTable";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { Sidebar } from "@/components/Sidebar";
import { StatsCards } from "@/components/StatsCards";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Plus, Calendar as CalendarIcon, User } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const APPOINTMENTS_QUERY_KEY = ["appointments"] as const;
const SERVICES_QUERY_KEY = ["services"] as const;
const EMPTY_APPOINTMENTS: Appointment[] = [];
const EMPTY_SERVICES: Service[] = [];

export default function App() {
  const queryClient = useQueryClient();
  const appointmentsQuery = useQuery({
    queryKey: APPOINTMENTS_QUERY_KEY,
    queryFn: appointmentService.getAppointments,
  });
  const servicesQuery = useQuery({
    queryKey: SERVICES_QUERY_KEY,
    queryFn: appointmentService.getServices,
  });
  const appointments = appointmentsQuery.data ?? EMPTY_APPOINTMENTS;
  const services = servicesQuery.data ?? EMPTY_SERVICES;
  const loading = appointmentsQuery.isLoading || servicesQuery.isLoading;
  const loadError =
    (appointmentsQuery.isError && !appointmentsQuery.data) ||
    (servicesQuery.isError && !servicesQuery.data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    window.localStorage.getItem("theme") === "dark"
  );
  
  // Estado para controlar qué sección del menú lateral está activa
  const [currentView, setCurrentView] = useState<string>("dashboard");

  const [searchTerm, setSearchTerm] = useState(() => {
    return new URLSearchParams(window.location.search).get("search") ?? "";
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    return new URLSearchParams(window.location.search).get("date") ?? "";
  });
  const [selectedStatus, setSelectedStatus] = useState<Appointment["status"] | "all">(() => {
    const status = new URLSearchParams(window.location.search).get("status");
    return status === "pending" || status === "confirmed" || status === "cancelled" || status === "completed"
      ? status
      : "all";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesName = appointment.clientName.toLowerCase().includes(normalizedSearch);
      const matchesDate = !selectedDate || appointment.date === selectedDate;
      const matchesStatus = selectedStatus === "all" || appointment.status === selectedStatus;

      return matchesName && matchesDate && matchesStatus;
    });
  }, [appointments, searchTerm, selectedDate, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / appointmentsPerPage));
  const displayedPage = Math.min(currentPage, totalPages);
  const paginatedAppointments = filteredAppointments.slice(
    (displayedPage - 1) * appointmentsPerPage,
    displayedPage * appointmentsPerPage
  );

  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  const updateSelectedDate = (value: string) => {
    setSelectedDate(value);
    setCurrentPage(1);
  };
  const updateSelectedStatus = (value: Appointment["status"] | "all") => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (searchTerm) params.set("search", searchTerm);
    if (selectedDate) params.set("date", selectedDate);
    if (selectedStatus !== "all") params.set("status", selectedStatus);

    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`
    );
  }, [searchTerm, selectedDate, selectedStatus]);

  const createAppointmentMutation = useMutation({
    mutationFn: async (optimisticAppointment: Appointment) => {
      return appointmentService.createAppointment({
        clientName: optimisticAppointment.clientName,
        clientPhone: optimisticAppointment.clientPhone,
        serviceId: optimisticAppointment.serviceId,
        date: optimisticAppointment.date,
        startTime: optimisticAppointment.startTime,
        status: optimisticAppointment.status,
        notes: optimisticAppointment.notes,
      });
    },
    onMutate: async (optimisticAppointment) => {
      await queryClient.cancelQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      const previousAppointments = queryClient.getQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY);
      queryClient.setQueryData<Appointment[]>(APPOINTMENTS_QUERY_KEY, (current) => [
        ...(current ?? []),
        optimisticAppointment,
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
    onError: (error, _optimisticAppointment, context) => {
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

  const editAppointmentMutation = useMutation({
    mutationFn: async ({
      nextAppointment,
    }: {
      nextAppointment: Appointment;
      previousAppointment: Appointment;
    }) => {
      return appointmentService.updateAppointment(nextAppointment.id, {
        clientName: nextAppointment.clientName,
        clientPhone: nextAppointment.clientPhone,
        serviceId: nextAppointment.serviceId,
        date: nextAppointment.date,
        startTime: nextAppointment.startTime,
        durationMinutes: nextAppointment.durationMinutes,
        status: nextAppointment.status,
        notes: nextAppointment.notes,
      });
    },
    onMutate: async ({ nextAppointment }) => {
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
    onError: (error, _variables, context) => {
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

  const deleteAppointmentMutation = useMutation({
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

  const handleSaveAppointment = (
    nextAppointment: Appointment,
    previousAppointment: Appointment | null
  ) => {
    if (previousAppointment) {
      editAppointmentMutation.mutate({ nextAppointment, previousAppointment });
      return;
    }

    createAppointmentMutation.mutate(nextAppointment);
  };

  const handleStatusChange = (id: string, newStatus: Appointment["status"]) => {
    if (newStatus === "cancelled") {
      const appointment = appointments.find((apt) => apt.id === id);

      if (!appointment) {
        return;
      }

      setAppointmentToCancel(appointment);
      return;
    }

    updateAppointmentStatus(id, newStatus);
  };

  const updateAppointmentStatus = (id: string, status: Appointment["status"]) => {
    updateStatusMutation.mutate({ id, status });
  };

  const confirmCancellation = async () => {
    if (!appointmentToCancel) {
      return;
    }

    const appointmentId = appointmentToCancel.id;
    setAppointmentToCancel(null);
    updateAppointmentStatus(appointmentId, "cancelled");
  };
  
  const handleDelete = (id: string) => {
    const appointment = appointments.find((item) => item.id === id);
    if (appointment) {
      deleteAppointmentMutation.mutate(appointment);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setAppointmentToEdit(appointment);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-96 max-w-full" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-5 h-9 w-16" />
                <Skeleton className="mt-2 h-4 w-40" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <Skeleton className="h-6 w-56" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">No se pudo cargar el panel</h1>
          <p className="mt-2 text-sm text-slate-500">
            No pudimos cargar las citas o los servicios. Revisa tu conexión e inténtalo nuevamente.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              void Promise.all([appointmentsQuery.refetch(), servicesQuery.refetch()]);
            }}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Izquierdo con control de vista */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isDarkMode={isDarkMode}
        onThemeChange={() => setIsDarkMode((current) => !current)}
      />

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                <CalendarIcon size={14} />
                <span>Hoy, 24 de Octubre</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                ¡Hola, Estre! 👋
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {currentView === "calendar" 
                  ? "Visualiza la agenda y disponibilidad horaria por profesional." 
                  : "Aquí tienes el resumen operativo y turnos programados para hoy."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setAppointmentToEdit(null);
                  setIsModalOpen(true);
                }}
                className="bg-primary hover:bg-rose-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm transition"
              >
                <Plus size={18} />
                Nueva Cita
              </button>
              
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                <User size={18} />
              </div>
            </div>
          </header>

          {/* Renderizado condicional según la opción seleccionada en el Sidebar */}
          {currentView === "dashboard" && (
            <>
              <StatsCards appointments={appointments} services={services} />
              <section className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-900">Listado de Citas Programadas</h2>
                  <span className="text-xs text-slate-400 font-medium">Actualizado en tiempo real</span>
                </div>
                
                <AppointmentTable 
                  appointments={paginatedAppointments}
                  services={services}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  searchTerm={searchTerm}
                  selectedDate={selectedDate}
                  selectedStatus={selectedStatus}
                  currentPage={displayedPage}
                  totalPages={totalPages}
                  totalFilteredAppointments={filteredAppointments.length}
                  onSearchChange={updateSearchTerm}
                  onDateChange={updateSelectedDate}
                  onStatusFilterChange={updateSelectedStatus}
                  onPageChange={setCurrentPage}
                />
              </section>
            </>
          )}

          {currentView === "appointments" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Gestión General de Citas & Turnos</h2>
              <AppointmentTable 
                appointments={paginatedAppointments}
                services={services}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onEdit={handleEdit}
                searchTerm={searchTerm}
                selectedDate={selectedDate}
                selectedStatus={selectedStatus}
                currentPage={displayedPage}
                totalPages={totalPages}
                totalFilteredAppointments={filteredAppointments.length}
                onSearchChange={updateSearchTerm}
                onDateChange={updateSelectedDate}
                onStatusFilterChange={updateSelectedStatus}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {currentView === "calendar" && (
            <AppointmentCalendar 
              appointments={appointments}
              services={services}
              onNewAppointmentClick={() => {
                setAppointmentToEdit(null);
                setIsModalOpen(true);
              }}
              onSelectAppointment={handleEdit}
            />
          )}

          {currentView === "services" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center py-12">
              <h2 className="text-lg font-bold text-slate-900">Módulo de Servicios</h2>
              <p className="text-slate-500 text-sm mt-1">Próximamente administración de catálogos y precios.</p>
            </div>
          )}

        </div>
      </main>

      {/* Modal de  Edición de Cita */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAppointmentToEdit(null);
        }}
        services={services}
        existingAppointments={appointments}
        appointmentToEdit={appointmentToEdit}
        onSaveAppointment={handleSaveAppointment}
      />

      <Dialog
        open={Boolean(appointmentToCancel)}
        onOpenChange={(open) => {
          if (!open) {
            setAppointmentToCancel(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cancelar esta cita?</DialogTitle>
            <DialogDescription>
              {appointmentToCancel
                ? `Se cancelará la cita de ${appointmentToCancel.clientName}. Esta acción cambiará su estado a cancelada.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAppointmentToCancel(null)}
            >
              Volver
            </Button>
            <Button variant="destructive" onClick={confirmCancellation}>
              Confirmar cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}