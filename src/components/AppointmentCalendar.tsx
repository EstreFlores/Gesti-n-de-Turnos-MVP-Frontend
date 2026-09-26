import { useState, useMemo } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { es } from "date-fns/locale";
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

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getWeekDays = (startDate: Date): string[] => {
  const days: string[] = [];
  const monday = getMonday(startDate);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    days.push(toDateKey(d));
  }
  return days;
};

export function AppointmentCalendar({
  appointments,
  services,
  onNewAppointmentClick,
  onSelectAppointment,
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    toDateKey(new Date())
  );
  
  const [calendarViewMode, setCalendarViewMode] = useState<"day" | "week" | "month">("day");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const weekDays = useMemo(() => {
    return getWeekDays(new Date(selectedDate + "T00:00:00"));
  }, [selectedDate]);

  const monthDays = useMemo(() => {
    const date = new Date(`${selectedDate}T00:00:00`);
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
    });
  }, [selectedDate]);

  const calendarAppointments = useMemo(() => {
    const visibleDates = calendarViewMode === "month"
      ? new Set(monthDays.map(toDateKey))
      : new Set(weekDays);

    return appointments.filter((appointment) => {
      const matchesVisibleRange = visibleDates.has(appointment.date);
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
      return matchesVisibleRange && matchesStatus;
    });
  }, [appointments, calendarViewMode, monthDays, statusFilter, weekDays]);

  const dayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesDate = apt.date === selectedDate;
      const matchesStatus = statusFilter === "all" || (apt.status as string) === statusFilter;
      return matchesDate && matchesStatus;
    });
  }, [appointments, selectedDate, statusFilter]);

  const weekAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesWeek = weekDays.includes(apt.date);
      const matchesStatus = statusFilter === "all" || (apt.status as string) === statusFilter;
      return matchesWeek && matchesStatus;
    });
  }, [appointments, weekDays, statusFilter]);

  const statusCounts = useMemo(() => {
    const countAppointments = calendarViewMode === "day"
      ? appointments.filter((apt) => apt.date === selectedDate)
      : calendarViewMode === "week"
        ? appointments.filter((apt) => weekDays.includes(apt.date))
        : appointments.filter((apt) => monthDays.some((day) => toDateKey(day) === apt.date));
    return {
      pending: countAppointments.filter(a => a.status === "pending").length,
      confirmed: countAppointments.filter(a => a.status === "confirmed").length,
      completed: countAppointments.filter(a => a.status === "completed").length,
    };
  }, [appointments, calendarViewMode, monthDays, selectedDate, weekDays]);

  const formattedDateTitle = useMemo(() => {
    const dateObj = new Date(selectedDate + "T00:00:00");
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(dateObj);
  }, [selectedDate]);

  const formattedWeekTitle = useMemo(() => {
    const start = new Date(weekDays[0] + "T00:00:00");
    const end = new Date(weekDays[6] + "T00:00:00");
    return `${start.getDate()} - ${end.getDate()} de ${new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(end)}`;
  }, [weekDays]);

  const formattedMonthTitle = useMemo(
    () => format(new Date(`${selectedDate}T00:00:00`), "MMMM yyyy", { locale: es }),
    [selectedDate]
  );

  const getServiceName = (serviceId: string) => {
    const s = services.find((serv) => serv.id === serviceId);
    return s ? s.name : "Servicio";
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(toDateKey(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDate(toDateKey(d));
  };

  const handlePrevWeek = () => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() - 7);
    setSelectedDate(toDateKey(d));
  };

  const handleNextWeek = () => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + 7);
    setSelectedDate(toDateKey(d));
  };

  const handlePrevMonth = () => {
    setSelectedDate(toDateKey(subMonths(new Date(`${selectedDate}T00:00:00`), 1)));
  };

  const handleNextMonth = () => {
    setSelectedDate(toDateKey(addMonths(new Date(`${selectedDate}T00:00:00`), 1)));
  };

  const handleToday = () => {
    setSelectedDate(toDateKey(new Date()));
  };

  const handlePreviousPeriod = () => {
    if (calendarViewMode === "month") {
      handlePrevMonth();
    } else if (calendarViewMode === "week") {
      handlePrevWeek();
    } else {
      handlePrevDay();
    }
  };

  const handleNextPeriod = () => {
    if (calendarViewMode === "month") {
      handleNextMonth();
    } else if (calendarViewMode === "week") {
      handleNextWeek();
    } else {
      handleNextDay();
    }
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
                onClick={handlePreviousPeriod}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition border border-slate-200 shadow-sm"
                title={calendarViewMode === "month" ? "Mes anterior" : calendarViewMode === "week" ? "Semana anterior" : "Día anterior"}
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
                onClick={handleNextPeriod}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition border border-slate-200 shadow-sm"
                title={calendarViewMode === "month" ? "Mes siguiente" : calendarViewMode === "week" ? "Semana siguiente" : "Día siguiente"}
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
              onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition border ${
                statusFilter === "pending" 
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm" 
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              }`}
            >
              Pendiente ({statusCounts.pending})
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === "confirmed" ? "all" : "confirmed")}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition border ${
                statusFilter === "confirmed" 
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm" 
                  : "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
              }`}
            >
              Confirmada ({statusCounts.confirmed})
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition border ${
                statusFilter === "completed" 
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
            {calendarViewMode === "month"
              ? formattedMonthTitle
              : calendarViewMode === "week"
                ? formattedWeekTitle
                : formattedDateTitle}
          </h3>
          {statusFilter !== "all" && (
            <span className="text-xs text-primary font-medium bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 flex items-center gap-2">
              Filtrado por: <strong className="capitalize">{statusFilter}</strong>
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

      {calendarViewMode === "day" && (
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
      )}

      {calendarViewMode === "week" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
          
          <div className="grid gap-px" style={{ gridTemplateColumns: `60px repeat(7, 1fr)` }}>
            
            <div className="p-3 text-xs font-bold text-slate-400 uppercase bg-slate-50/70 border-b border-slate-100 flex items-center justify-center gap-1 sticky left-0 z-10">
              <Clock size={14} /> Hora
            </div>
            
            {weekDays.map((day) => {
              const dayDate = new Date(day + "T00:00:00");
              const dayName = new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(dayDate);
              const dayNum = dayDate.getDate();
              const isToday = day === toDateKey(new Date());
              
              return (
                <div 
                  key={day} 
                  className={`p-3 text-xs font-bold text-center border-b border-slate-100 ${
                    isToday ? "bg-primary/10 border-b-2 border-primary" : "bg-slate-50/70"
                  }`}
                >
                  <div className={isToday ? "text-primary" : "text-slate-600"}>{dayName.toUpperCase()}</div>
                  <div className={`text-sm font-extrabold ${isToday ? "text-primary" : "text-slate-900"}`}>{dayNum}</div>
                </div>
              );
            })}

            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                
                <div className="p-3 text-xs font-semibold text-slate-400 border-b border-slate-100 bg-slate-50/30 flex items-center justify-center min-h-[90px] sticky left-0 z-10">
                  {hour}
                </div>

                {weekDays.map((day) => {
                  const aptForSlot = weekAppointments.find(
                    (apt) => apt.date === day && apt.startTime.startsWith(hour.substring(0, 2))
                  );

                  return (
                    <div 
                      key={`${day}-${hour}`} 
                      className="p-2 border-b border-slate-100 relative group min-h-[90px] flex items-center"
                    >
                      {aptForSlot ? (
                        <div 
                          onClick={() => onSelectAppointment(aptForSlot)}
                          className="w-full bg-rose-50/90 border border-rose-200 hover:border-primary/50 rounded-xl p-2 cursor-pointer shadow-sm transition hover:shadow-md"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold text-xs text-slate-900 truncate flex-1">
                              {aptForSlot.clientName}
                            </span>
                            <span className="text-[8px] bg-primary text-white px-1 py-0.5 rounded-full font-medium uppercase whitespace-nowrap">
                              {aptForSlot.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-primary font-medium mt-0.5 truncate">
                            {getServiceName(aptForSlot.serviceId)}
                          </p>
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
                            <Clock size={9} /> {aptForSlot.startTime}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            Libre
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
      )}

      {calendarViewMode === "month" && (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((weekday) => (
              <div
                key={weekday}
                className="p-2 text-center text-xs font-bold uppercase text-slate-500 sm:p-3"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {monthDays.map((day) => {
              const dayKey = toDateKey(day);
              const dayAppointmentsForCell = calendarAppointments
                .filter((appointment) => appointment.date === dayKey)
                .sort((first, second) => first.startTime.localeCompare(second.startTime));
              const isCurrentMonth = day.getMonth() === new Date(`${selectedDate}T00:00:00`).getMonth();
              const isToday = dayKey === toDateKey(new Date());

              return (
                <div
                  key={dayKey}
                  className={`min-h-28 border-b border-r border-slate-100 p-1.5 sm:min-h-36 sm:p-2 ${
                    isCurrentMonth ? "bg-white" : "bg-slate-50/70"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(dayKey);
                      setCalendarViewMode("day");
                    }}
                    aria-label={`Ver citas del ${format(day, "d 'de' MMMM", { locale: es })}`}
                    className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-primary text-white"
                        : isCurrentMonth
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {day.getDate()}
                  </button>

                  <div className="space-y-1">
                    {dayAppointmentsForCell.slice(0, 3).map((appointment) => (
                      <button
                        type="button"
                        key={appointment.id}
                        onClick={() => onSelectAppointment(appointment)}
                        title={`${appointment.startTime} · ${appointment.clientName} · ${getServiceName(appointment.serviceId)}`}
                        className="block w-full truncate rounded-md border border-rose-200 bg-rose-50 px-1.5 py-1 text-left text-[10px] leading-tight text-rose-900 transition hover:border-primary/50 sm:text-xs"
                      >
                        <span className="font-semibold">{appointment.startTime}</span>{" "}
                        <span>{appointment.clientName}</span>
                      </button>
                    ))}
                    {dayAppointmentsForCell.length > 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDate(dayKey);
                          setCalendarViewMode("day");
                        }}
                        className="px-1 text-[10px] font-semibold text-primary hover:underline"
                      >
                        +{dayAppointmentsForCell.length - 3} más
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}