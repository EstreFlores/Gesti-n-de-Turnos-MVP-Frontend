import { Users, Clock, CheckCircle2, DollarSign } from "lucide-react";

export function StatsCards() {
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
          <span className="text-3xl font-extrabold text-slate-900">18</span>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
        </div>
        <span className="text-xs text-slate-400 mt-1">Capacidad de agenda: 82%</span>
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
          <span className="text-3xl font-extrabold text-slate-900">4</span>
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Requeridas</span>
        </div>
        <span className="text-xs text-slate-400 mt-1">Tiempo medio resp.: &lt; 15m</span>
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
          <span className="text-3xl font-extrabold text-slate-900">9</span>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">50% marchando</span>
        </div>
        <span className="text-xs text-slate-400 mt-1">Satisfacción cliente: 4.9/5.0</span>
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
          <span className="text-3xl font-extrabold text-slate-900">$485.000</span>
        </div>
        <span className="text-xs text-slate-400 mt-1">Ticket promedio: 5 pagos listos</span>
      </div>
    </div>
  );
}