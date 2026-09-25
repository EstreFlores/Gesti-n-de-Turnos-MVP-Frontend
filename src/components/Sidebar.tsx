import { LayoutDashboard, CalendarDays, Calendar, Scissors } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
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
        <button
          onClick={() => onViewChange("dashboard")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
            currentView === "dashboard"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button
          onClick={() => onViewChange("appointments")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
            currentView === "appointments"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <CalendarDays size={18} />
          Citas & Turnos
        </button>

        <button
          onClick={() => onViewChange("calendar")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
            currentView === "calendar"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Calendar size={18} />
          Calendario Diario
        </button>

        <button
          onClick={() => onViewChange("services")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
            currentView === "services"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Scissors size={18} />
          Servicios
        </button>
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