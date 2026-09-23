import { isBefore, parseISO, startOfToday } from "date-fns";
import { z } from "zod";

export const appointmentFormSchema = z.object({
  clientName: z
    .string()
    .min(2, {
      message: "El nombre del cliente debe tener al menos 2 caracteres.",
    }),

  clientPhone: z.string().optional(),

  serviceId: z
    .string()
    .min(1, {
      message: "Debes seleccionar un servicio.",
    }),

  date: z
    .string()
    .min(1, {
      message: "La fecha es obligatoria.",
    })
    .refine(
      (date) => !isBefore(parseISO(date), startOfToday()),
      {
        message: "La fecha no puede ser anterior a hoy.",
      }
    ),

  startTime: z
    .string()
    .min(1, {
      message: "La hora de inicio es obligatoria.",
    }),

  durationMinutes: z.coerce
    .number()
    .int({
      message: "La duración debe ser un número entero.",
    })
    .positive({
      message: "La duración debe ser mayor a 0 minutos.",
    }),

  notes: z.string().optional(),

  status: z
    .enum(["pending", "confirmed", "completed", "cancelled"])
    .default("pending"),
});

export type AppointmentFormValues = z.infer<
  typeof appointmentFormSchema
>;