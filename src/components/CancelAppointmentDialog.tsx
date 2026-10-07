import type { Appointment } from "@/types/appointment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CancelAppointmentDialogProps {
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelAppointmentDialog({
  appointment,
  onClose,
  onConfirm,
}: CancelAppointmentDialogProps) {
  return (
    <Dialog open={Boolean(appointment)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Cancelar esta cita?</DialogTitle>
          <DialogDescription>
            {appointment
              ? `Se cancelará la cita de ${appointment.clientName}. Esta acción cambiará su estado a cancelada.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Volver
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Confirmar cancelación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
