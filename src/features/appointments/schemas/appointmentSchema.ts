import { z } from "zod";

export const appointmentFormSchema = z.object({
  clientName: z.string().min(2, { message: "El nombre del cliente debe tener al menos 2 caracteres." }),
  clientPhone: z.string().optional(),
  serviceId: z.string({ message: "Debes seleccionar un servicio." }),
  date: z.string().min(1, { message: "La fecha es obligatoria." }),
  startTime: z.string().min(1, { message: "La hora de inicio es obligatoria." }),
  notes: z.string().optional(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).default("pending"),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;