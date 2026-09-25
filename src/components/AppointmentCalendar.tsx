import { useState, useMemo } from "react";
import type { Appointment, Service } from "@/types/appointment";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  services: Service[];
  onNewAppointmentClick: () => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

const PROFESSIONALS = [
  "Dra. Camila Santos",
  "Lic. Mariana Gaviria",
  "Valeria Martínez",
  "Sofía Gómez"
];

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export function AppointmentCalendar({
  appointments,
  services,
  onNewAppointmentClick,
  onSelectAppointment,
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  
  const [calendarViewMode, setCalendarViewMode] = useState<"day" | "week" | "month">("day");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const dayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesDate = apt.date === selectedDate;
      const matchesStatus = statusFilter === "all" || (apt.status as string) === statusFilter;
      return matchesDate && matchesStatus;
    });
  }, [appointments, selectedDate, statusFilter]);

  const statusCounts = useMemo(() => {
    const currentDayApts = appointments.filter((apt) => apt.date === selectedDate);
    return {
      pending: currentDayApts.filter(a => (a.status as string) === "pendiente" || (a.status as string) === "PENDING").length,
      confirmed: currentDayApts.filter(a => (a.status as string) === "confirmada" || (a.status as string) === "CONFIRMED").length,
      inProgress: currentDayApts.filter(a => (a.status as string) === "en-curso" || (a.status as string) === "IN_PROGRESS").length,
      completed: currentDayApts.filter(a => (a.status as string) === "completada" || (a.status as string) === "COMPLETED").length,
    };
  }, [appointments, selectedDate]);

  const formattedDateTitle = useMemo(() => {
    const dateObj = new Date(selectedDate + "T00:00:00");
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(dateObj);
  }, [selectedDate]);

  const getServiceName = (serviceId: string) => {
    const s = services.find((serv) => serv.id === serviceId);
    return s ? s.name : "Servicio";
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setCalendarViewMode("day")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  calendarViewMode === "day"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Día
              </button>
              <button
                onClick={() => setCalendarViewMode("week")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  calendarViewMode === "week"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setCalendarViewMode("month")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  calendarViewMode === "month"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Mes
              </button>
            </div>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <button 
                onClick={handlePrevDay}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition border border-slate-200 shadow-sm"
                title="Día anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <button 
                onClick={handleToday}
                className="px-3 py-2 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition border border-slate-200 shadow-sm"
              >
                Hoy
              </button>

              <button 
                onClick={handleNextDay}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition border border-slate-200 shadow-sm"
                title="Día siguiente"
              >
                <ChevronRight size={16} />
              </button>

              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 hover:border-slate-300 transition">
                <CalendarIcon size={14} className="text-slate-400 mr-2" />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter(statusFilter === "pendiente" ? "all" : "pendiente")}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition border ${
                statusFilter === "pendiente" 
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm" 
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              }`}
            >
              Pendiente ({statusCounts.pending})
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === "confirmada" ? "all" : "confirmada")}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition border ${
                statusFilter === "confirmada" 
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm" 
                  : "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
              }`}
            >
              Confirmada ({statusCounts.confirmed})
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === "en-curso" ? "all" : "en-curso")}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition border ${
                statusFilter === "en-curso" 
                  ? "bg-rose-700 text-white border-rose-700 shadow-sm" 
                  : "bg-rose-50 text-primary border-rose-200 hover:bg-rose-100"
              }`}
            >
              En Curso ({statusCounts.inProgress})
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === "completada" ? "all" : "completada")}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition border ${
                statusFilter === "completada" 
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              Completada ({statusCounts.completed})
            </button>

            <Button 
              onClick={onNewAppointmentClick}
              className="bg-primary hover:bg-rose-700 text-white rounded-xl text-xs flex items-center gap-2 shadow-sm ml-2"
            >
              <Plus size={15} /> Nueva Cita
            </Button>
          </div>

        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 capitalize">
            {formattedDateTitle}
          </h3>
          {statusFilter !== "all" && (
            <span className="text-xs text-primary font-medium bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 flex items-center gap-2">
              Filtrado por estado: <strong className="capitalize">{statusFilter}</strong>
              <button 
                onClick={() => setStatusFilter("all")}
                className="text-slate-400 hover:text-slate-700 ml-1 font-bold"
              >
                ×
              </button>
            </span>
          )}
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="grid grid-cols-5 border-b border-slate-100 bg-slate-50/70 text-center">
          <div className="p-3 text-xs font-bold text-slate-400 uppercase border-r border-slate-100 flex items-center justify-center gap-1">
            <Clock size={14} /> Hora
          </div>
          {PROFESSIONALS.map((prof, idx) => (
            <div key={idx} className="p-3 border-r border-slate-100 last:border-r-0">
              <div className="font-bold text-slate-800 text-xs truncate">{prof}</div>
              <div className="text-[10px] text-slate-400">Cabina Glow</div>
            </div>
          ))}
        </div>

        <div className="divide-y divide-slate-100">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-5 min-h-[70px]">
              
              <div className="p-3 text-xs font-semibold text-slate-400 border-r border-slate-100 bg-slate-50/30 flex items-start justify-center">
                {hour}
              </div>

              {PROFESSIONALS.map((_, profIdx) => {
                const matchedApt = dayAppointments.find(
                  (apt) => apt.startTime.startsWith(hour.substring(0, 2))
                );

                return (
                  <div key={profIdx} className="p-2 border-r border-slate-100 last:border-r-0 relative group">
                    {matchedApt ? (
                      <div 
                        onClick={() => onSelectAppointment(matchedApt)}
                        className="bg-rose-50/90 border border-rose-200 hover:border-primary/50 rounded-xl p-2.5 cursor-pointer shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {matchedApt.clientName}
                          </span>
                          <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-medium uppercase">
                            {matchedApt.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-primary font-medium mt-0.5 truncate">
                          {getServiceName(matchedApt.serviceId)}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                          <Clock size={10} /> {matchedApt.startTime} ({matchedApt.durationMinutes}m)
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                          Disponible
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}