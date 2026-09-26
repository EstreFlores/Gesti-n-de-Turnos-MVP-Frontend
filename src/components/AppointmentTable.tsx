import React from "react";
import type { Appointment, Service } from "../types/appointment";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Clock, Phone } from "lucide-react";

interface AppointmentTableProps {
  appointments: Appointment[];
  services: Service[];
  onStatusChange: (id: string, newStatus: Appointment["status"]) => void;
  onDelete: (id: string) => void;
  onEdit: (appointment: Appointment) => void;
  searchTerm: string;
  selectedDate: string;
  selectedStatus: Appointment["status"] | "all";
  currentPage: number;
  totalPages: number;
  totalFilteredAppointments: number;
  onSearchChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onStatusFilterChange: (value: Appointment["status"] | "all") => void;
  onPageChange: (page: number) => void;
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  services,
  onStatusChange,
  onDelete,
  onEdit,
  searchTerm,
  selectedDate,
  selectedStatus,
  currentPage,
  totalPages,
  totalFilteredAppointments,
  onSearchChange,
  onDateChange,
  onStatusFilterChange,
  onPageChange,
}) => {
  const getServiceName = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    return service ? service.name : "Servicio general";
  };

  const statusConfig: Record<Appointment["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Pendiente", variant: "secondary" },
    confirmed: { label: "Confirmada", variant: "default" },
    completed: { label: "Completada", variant: "outline" },
    cancelled: { label: "Cancelada", variant: "destructive" },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre del cliente"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select
          value={selectedStatus}
          onChange={(event) =>
            onStatusFilterChange(event.target.value as Appointment["status"] | "all")
          }
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmada</option>
          <option value="cancelled">Cancelada</option>
          <option value="completed">Completada</option>
        </select>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">
            {totalFilteredAppointments === 0 && (searchTerm || selectedDate || selectedStatus !== "all")
              ? "No hay citas que coincidan con los filtros."
              : "No hay turnos registrados en este momento."}
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP: Tabla */}
          <div className="border rounded-lg overflow-hidden bg-white shadow-sm hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => {
                  const currentStatus = statusConfig[apt.status];
                  return (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">
                        <div>{apt.clientName}</div>
                        {apt.clientPhone && (
                          <div className="text-xs text-muted-foreground">{apt.clientPhone}</div>
                        )}
                      </TableCell>
                      <TableCell>{getServiceName(apt.serviceId)}</TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold">{apt.date}</div>
                        <div className="text-xs text-muted-foreground">{apt.startTime} hrs</div>
                      </TableCell>
                      <TableCell>{apt.durationMinutes} min</TableCell>
                      <TableCell>
                        <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {apt.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => onStatusChange(apt.id, "confirmed")}>Confirmar</Button>
                        )}
                        {apt.status === "confirmed" && (
                          <Button size="sm" variant="outline" onClick={() => onStatusChange(apt.id, "completed")}>Completar</Button>
                        )}
                        {(apt.status === "pending" || apt.status === "confirmed") && (
                          <Button size="sm" variant="destructive" onClick={() => onStatusChange(apt.id, "cancelled")}>Cancelar</Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => onDelete(apt.id)}>Eliminar</Button>
                        <Button size="sm" variant="outline" onClick={() => onEdit(apt)}>Editar</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* MÓVIL: Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {appointments.map((apt) => {
              const currentStatus = statusConfig[apt.status];
              return (
                <div key={apt.id} className="border border-slate-200 rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{apt.clientName}</h3>
                      {apt.clientPhone && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Phone size={12} /> {apt.clientPhone}
                        </div>
                      )}
                    </div>
                    <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div><span className="font-medium">Servicio:</span> {getServiceName(apt.serviceId)}</div>
                    <div className="flex items-center gap-2"><Clock size={14} /> {apt.date} a las {apt.startTime}</div>
                    <div><span className="font-medium">Duración:</span> {apt.durationMinutes} min</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {apt.status === "pending" && <Button size="sm" variant="outline" onClick={() => onStatusChange(apt.id, "confirmed")} className="flex-1 text-xs">Confirmar</Button>}
                    {apt.status === "confirmed" && <Button size="sm" variant="outline" onClick={() => onStatusChange(apt.id, "completed")} className="flex-1 text-xs">Completar</Button>}
                    {(apt.status === "pending" || apt.status === "confirmed") && <Button size="sm" variant="destructive" onClick={() => onStatusChange(apt.id, "cancelled")} className="flex-1 text-xs">Cancelar</Button>}
                    <Button size="sm" variant="outline" onClick={() => onEdit(apt)} className="flex-1 text-xs"><Edit size={14} /></Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(apt.id)} className="flex-1 text-xs"><Trash2 size={14} /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Página {currentPage} de {totalPages} ({totalFilteredAppointments} citas)</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Anterior</Button>
            <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Siguiente</Button>
          </div>
        </div>
      )}
    </div>
  );
};
