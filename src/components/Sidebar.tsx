import { LayoutDashboard, CalendarDays, Calendar, Scissors } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Logo / Título */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
          E
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-sm">Glow by Estrella</h2>
          <span className="text-xs text-slate-500">GESTIÓN DE TURNOS</span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white font-medium text-sm shadow-sm"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition"
        >
          <CalendarDays size={18} />
          Citas & Turnos
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition"
        >
          <Calendar size={18} />
          Calendario Diario
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition"
        >
          <Scissors size={18} />
          Servicios
        </a>
      </nav>

      {/* Estado inferior de sala */}
      <div className="p-4 border-t border-slate-100 m-4 bg-slate-50 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-700">ESTADO SALA</span>
        </div>
        <span className="text-xs text-slate-500">4 en atención</span>
      </div>
    </aside>
  );
}