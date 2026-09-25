import { useEffect, useMemo, useState } from "react";
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

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  
  // Estado para controlar qué sección del menú lateral está activa
  const [currentView, setCurrentView] = useState<string>("dashboard");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Appointment["status"] | "all">("all");
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
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * appointmentsPerPage,
    currentPage * appointmentsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate, selectedStatus]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const [fetchedAppointments, fetchedServices] = await Promise.all([
        appointmentService.getAppointments(),
        appointmentService.getServices(),
      ]);
      setAppointments(fetchedAppointments);
      setServices(fetchedServices);
    } catch (error) {
      console.error("Error al cargar los datos de la API:", error);
      setLoadError("No pudimos cargar las citas. Revisa tu conexión e inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshAppointments = async () => {
    try {
      const fetchedAppointments = await appointmentService.getAppointments();
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Error al refrescar citas:", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Appointment["status"]) => {
    if (newStatus === "cancelled") {
      const appointment = appointments.find((apt) => apt.id === id);

      if (!appointment) {
        return;
      }

      setAppointmentToCancel(appointment);
      return;
    }

    await updateAppointmentStatus(id, newStatus);
  };

  const updateAppointmentStatus = async (id: string, newStatus: Appointment["status"]) => {
    const previousAppointment = appointments.find((apt) => apt.id === id);

    if (!previousAppointment) {
      return;
    }

    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id
          ? { ...apt, status: newStatus, updatedAt: new Date().toISOString() }
          : apt
      )
    );

    try {
      const updated = await appointmentService.updateAppointmentStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? updated : apt))
      );
      toast.add({
        title: "Estado actualizado",
        description: `La cita de ${previousAppointment.clientName} ahora está ${newStatus === "confirmed" ? "confirmada" : newStatus === "completed" ? "completada" : "cancelada"}.`,
        type: "success",
      });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? previousAppointment : apt))
      );
      toast.add({
        title: "No se pudo actualizar el estado",
        description: "La cita volvió a su estado anterior porque ocurrió un error.",
        type: "error",
      });
    }
  };

  const confirmCancellation = async () => {
    if (!appointmentToCancel) {
      return;
    }

    const appointmentId = appointmentToCancel.id;
    setAppointmentToCancel(null);
    await updateAppointmentStatus(appointmentId, "cancelled");
  };
  
  const handleDelete = async (id: string) => {
    try {
      await appointmentService.deleteAppointment(id);
      setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      toast.add({
        title: "Cita eliminada",
        description: "La cita se eliminó correctamente.",
        type: "success",
      });
    } catch (error) {
      console.error("Error al eliminar cita:", error);
      toast.add({
        title: "No se pudo eliminar la cita",
        description: "Ocurrió un error al intentar eliminarla.",
        type: "error",
      });
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
          <p className="mt-2 text-sm text-slate-500">{loadError}</p>
          <Button className="mt-6" onClick={loadData}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Izquierdo con control de vista */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

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
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalFilteredAppointments={filteredAppointments.length}
                  onSearchChange={setSearchTerm}
                  onDateChange={setSelectedDate}
                  onStatusFilterChange={setSelectedStatus}
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
                currentPage={currentPage}
                totalPages={totalPages}
                totalFilteredAppointments={filteredAppointments.length}
                onSearchChange={setSearchTerm}
                onDateChange={setSelectedDate}
                onStatusFilterChange={setSelectedStatus}
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
        onAppointmentCreated={refreshAppointments}
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