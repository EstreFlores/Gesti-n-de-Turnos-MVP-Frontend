import { useEffect, useState } from "react";
import { appointmentService } from "@/features/appointments/api/appointmentService";
import type { Appointment, Service } from "@/types/appointment";
import { AppointmentTable } from "@/components/AppointmentTable";
import { Sidebar } from "@/components/Sidebar";
import { StatsCards } from "@/components/StatsCards";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Plus, Calendar as CalendarIcon, User } from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedAppointments, fetchedServices] = await Promise.all([
          appointmentService.getAppointments(),
          appointmentService.getServices(),
        ]);
        setAppointments(fetchedAppointments);
        setServices(fetchedServices);
      } catch (error) {
        console.error("Error al cargar los datos de la API:", error);
      } finally {
        setLoading(false);
      }
    }
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
    try {
      const updated = await appointmentService.updateAppointmentStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? updated : apt))
      );
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
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
      <div className="flex justify-center items-center h-screen bg-slate-50 text-slate-500 font-medium">
        Cargando panel operativo de Glow by Estrella...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Izquierdo */}
      <Sidebar />

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Superior */}
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
                Aquí tienes el resumen operativo y turnos programados para hoy.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
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

          {/* Tarjetas de Resumen (KPIs) */}
          <StatsCards />

          {/* Sección de la Tabla de Turnos */}
          <section className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Listado de Citas Programadas</h2>
              <span className="text-xs text-slate-400 font-medium">Actualizado en tiempo real</span>
            </div>
            
            <AppointmentTable 
              appointments={appointments}
              services={services}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </section>

        </div>
      </main>

      {/* Modal de Nueva Cita  */}
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
    </div>
  );
}