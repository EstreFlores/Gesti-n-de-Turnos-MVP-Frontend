import { Users, Clock, CheckCircle2, DollarSign } from "lucide-react";
import type { Appointment, Service } from "@/types/appointment";

interface StatsCardsProps {
  appointments: Appointment[];
  services: Service[];
}

export function StatsCards({ appointments, services }: StatsCardsProps) {
  const today = new Date().toISOString().split("T")[0];
  const todaysAppointments = appointments.filter(
    (appointment) => appointment.date === today && appointment.status !== "cancelled"
  );
  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "pending"
  );
  const completedToday = appointments.filter(
    (appointment) => appointment.date === today && appointment.status === "completed"
  );
  const estimatedRevenue = todaysAppointments.reduce((total, appointment) => {
    const service = services.find((item) => item.id === appointment.serviceId);
    return total + (service?.price ?? 0);
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Citas de Hoy</span>
          <div className="p-2 bg-rose-50 text-primary rounded-xl">
            <Users size={18} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{todaysAppointments.length}</span>
        </div>
        <span className="text-xs text-slate-400 mt-1">Citas programadas no canceladas</span>
      </div>

      {/* Card 2 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendientes de Confirmar</span>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={18} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{pendingAppointments.length}</span>
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Requeridas</span>
        </div>
        <span className="text-xs text-slate-400 mt-1">Citas pendientes de confirmación</span>
      </div>

      {/* Card 3 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completados Hoy</span>
          <div className="p-2 bg-blue-50 text-tertiary rounded-xl">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{completedToday.length}</span>
        </div>
        <span className="text-xs text-slate-400 mt-1">Citas completadas en el día</span>
      </div>

      {/* Card 4 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresos Estimados</span>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign size={18} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">
            ${estimatedRevenue.toLocaleString("es-CO")}
          </span>
        </div>
        <span className="text-xs text-slate-400 mt-1">Servicios agendados para hoy</span>
      </div>
    </div>
  );
}