import type { ReactNode } from "react";
import { Calendar as CalendarIcon, Plus, User } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

interface AppLayoutProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isDarkMode: boolean;
  onThemeChange: () => void;
  onNewAppointment: () => void;
  children: ReactNode;
}

export function AppLayout({
  currentView,
  onViewChange,
  isDarkMode,
  onThemeChange,
  onNewAppointment,
  children,
}: AppLayoutProps) {
  const todayLabel = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        currentView={currentView}
        onViewChange={onViewChange}
        isDarkMode={isDarkMode}
        onThemeChange={onThemeChange}
      />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-400">
                <CalendarIcon size={14} />
                <span>Hoy, {todayLabel}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                ¡Hola, Estre! 👋
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {currentView === "calendar"
                  ? "Visualiza la agenda y disponibilidad horaria por profesional."
                  : "Aquí tienes el resumen operativo y turnos programados para hoy."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onNewAppointment}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700"
              >
                <Plus size={18} />
                Nueva Cita
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-bold text-slate-700">
                <User size={18} />
              </div>
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
