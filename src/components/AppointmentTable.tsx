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

interface AppointmentTableProps {
  appointments: Appointment[];
  services: Service[];
  onStatusChange: (id: string, newStatus: Appointment["status"]) => void;
  onDelete: (id: string) => void;
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  services,
  onStatusChange,
  onDelete,
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

  if (appointments.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No hay turnos registrados en este momento.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
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
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onStatusChange(apt.id, "confirmed")}
                    >
                      Confirmar
                    </Button>
                  )}
                  {apt.status === "confirmed" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onStatusChange(apt.id, "completed")}
                    >
                      Completar
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => onDelete(apt.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};