import { useState } from "react";
import type { Service } from "@/types/appointment";
import { appointmentService } from "@/features/appointments/api/appointmentService";
import { X, Calendar, Clock, User, Phone, FileText, Scissors } from "lucide-react";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onAppointmentCreated: () => void; // Para recargar la lista al crear
}

export function AppointmentModal({ isOpen, onClose, services, onAppointmentCreated }: AppointmentModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id || "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !serviceId || !date || !startTime) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    try {
      setLoading(true);
      // Creamos la cita usando tu servicio existente
      await appointmentService.createAppointment({
        clientName,
        clientPhone,
        serviceId,
        date,
        startTime,
        status: "pending", // Por defecto entra como pendiente
        notes,
      });

      // Limpiar formulario y cerrar
      setClientName("");
      setClientPhone("");
      setDate("");
      setStartTime("");
      setNotes("");
      onAppointmentCreated();
      onClose();
    } catch (error) {
      console.error("Error al crear la cita:", error);
      alert("Hubo un error al registrar la cita.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header del Modal */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-primary flex items-center justify-center font-bold">
              +
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Nueva Cita</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Nombre del Cliente */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre del Cliente</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User size={16} />
              </span>
              <input 
                type="text" 
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. María Fernanda Gómez"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>

          {/* Teléfono / WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">WhatsApp / Teléfono</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Phone size={16} />
              </span>
              <input 
                type="text" 
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ej. +52 55 1234 5678"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>

          {/* Selector de Servicio */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tratamiento o Servicio</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Scissors size={16} />
              </span>
              <select 
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} (${service.price} - {service.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha y Hora en Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fecha de Cita</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Calendar size={16} />
                </span>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Hora Inicio</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Clock size={16} />
                </span>
                <input 
                  type="time" 
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            </div>
          </div>

          {/* Notas Opcionales */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Notas Clínicas / Preferencias (Opcional)</label>
            <div className="relative">
              <span className="absolute top-3 left-3 text-slate-400">
                <FileText size={16} />
              </span>
              <textarea 
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Preferencia de color nude, alergias, etc."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-rose-700 shadow-sm transition disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Confirmar y Guardar Turno"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}