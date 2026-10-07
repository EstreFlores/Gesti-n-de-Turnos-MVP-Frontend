import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CalendarViewMode } from "@/features/appointments/components/AppointmentCalendar/calendarUtils";

interface CalendarToolbarProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (view: CalendarViewMode) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  statusCounts: { pending: number; confirmed: number; completed: number };
  dateTitle: string;
  weekTitle: string;
  monthTitle: string;
  onPrevious: () => void;
  onToday: () => void;
  onNext: () => void;
  onNewAppointment: () => void;
}

export function CalendarToolbar({
  viewMode,
  onViewModeChange,
  selectedDate,
  onDateChange,
  statusFilter,
  onStatusFilterChange,
  statusCounts,
  dateTitle,
  weekTitle,
  monthTitle,
  onPrevious,
  onToday,
  onNext,
  onNewAppointment,
}: CalendarToolbarProps) {
  const statusOptions = [
    { value: "pending", label: "Pendiente", count: statusCounts.pending, active: "bg-amber-600 text-white border-amber-600 shadow-sm", inactive: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
    { value: "confirmed", label: "Confirmada", count: statusCounts.confirmed, active: "bg-sky-600 text-white border-sky-600 shadow-sm", inactive: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100" },
    { value: "completed", label: "Completada", count: statusCounts.completed, active: "bg-emerald-600 text-white border-emerald-600 shadow-sm", inactive: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
  ];
  const periodLabel = viewMode === "month" ? "Mes" : viewMode === "week" ? "Semana" : "Día";

  return (
    <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl bg-slate-100 p-1">
            {(["day", "week", "month"] as const).map((view) => (
              <button
                key={view}
                onClick={() => onViewModeChange(view)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === view ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {view === "day" ? "Día" : view === "week" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
          <div className="hidden h-5 w-px bg-slate-200 sm:block" />
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPrevious}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 shadow-sm transition hover:bg-slate-100"
              title={`${periodLabel} anterior`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onToday}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              Hoy
            </button>
            <button
              onClick={onNext}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 shadow-sm transition hover:bg-slate-100"
              title={`${periodLabel} siguiente`}
            >
              <ChevronRight size={16} />
            </button>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 transition hover:border-slate-300">
              <CalendarIcon size={14} className="mr-2 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => onDateChange(event.target.value)}
                className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => onStatusFilterChange(statusFilter === status.value ? "all" : status.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === status.value ? status.active : status.inactive
              }`}
            >
              {status.label} ({status.count})
            </button>
          ))}
          <Button
            onClick={onNewAppointment}
            className="ml-2 flex items-center gap-2 rounded-xl bg-primary text-xs text-white shadow-sm hover:bg-rose-700"
          >
            <Plus size={15} /> Nueva Cita
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
        <h3 className="text-base font-extrabold capitalize text-slate-900">
          {viewMode === "month" ? monthTitle : viewMode === "week" ? weekTitle : dateTitle}
        </h3>
        {statusFilter !== "all" && (
          <span className="flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-medium text-primary">
            Filtrado por: <strong className="capitalize">{statusFilter}</strong>
            <button
              onClick={() => onStatusFilterChange("all")}
              className="ml-1 font-bold text-slate-400 hover:text-slate-700"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
