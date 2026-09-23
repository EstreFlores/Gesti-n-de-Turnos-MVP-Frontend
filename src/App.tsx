import { useEffect, useState } from "react";
import { appointmentService } from "@/features/appointments/api/appointmentService";
import type { Appointment, Service } from "@/types/appointment";
import { AppointmentTable } from "@/components/AppointmentTable";

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar datos reales desde MockAPI al montar el componente
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

  // Manejar cambio de estado (PUT /appointments/:id)
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

  // Manejar eliminación de cita (DELETE /appointments/:id)
  const handleDelete = async (id: string) => {
    if (confirm("¿Estás segura de que deseas eliminar este turno?")) {
      try {
        await appointmentService.deleteAppointment(id);
        setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      } catch (error) {
        console.error("Error al eliminar cita:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 text-muted-foreground">
        Esta es una prueba para conectar con MockAPI y cargando turnos del salón...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Turnos</h1>
            <p className="text-muted-foreground">Salón de Belleza - Panel de Control Interno con (MockAPI)</p>
          </div>
          {/* Próximamente el botón para abrir el modal de nueva cita */}
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Listado de Citas Programadas</h2>
          <AppointmentTable 
            appointments={appointments}
            services={services}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        </section>
      </div>
    </main>
  );
}