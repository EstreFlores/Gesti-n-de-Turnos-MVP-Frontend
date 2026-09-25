import { isBefore, parseISO, startOfToday } from "date-fns";
import { z } from "zod";

export const appointmentFormSchema = z.object({
  clientName: z
    .string()
    .min(2, { message: "El nombre del cliente debe tener al menos 2 caracteres." })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: "El nombre solo debe contener letras y espacios." }),

  clientPhone: z
    .string()
    .min(10, { message: "El teléfono debe tener al menos 10 dígitos." })
    .regex(/^\+?[0-9\s()-]+$/, { message: "Ingresa un número de teléfono válido." }),

  serviceId: z
    .string()
    .min(1, { message: "Debes seleccionar un servicio." }),

  date: z
    .string()
    .min(1, { message: "La fecha es obligatoria." })
    .refine((date) => !isBefore(parseISO(date), startOfToday()), {
      message: "La fecha no puede ser anterior a hoy.",
    }),

  startTime: z
    .string()
    .min(1, { message: "La hora de inicio es obligatoria." }),

  durationMinutes: z.coerce
    .number()
    .int({ message: "La duración debe ser un número entero." })
    .positive({ message: "La duración debe ser mayor a 0 minutos." }),

  notes: z.string().optional(),

  status: z
    .enum(["pending", "confirmed", "completed", "cancelled"])
    .default("pending"),
}).superRefine(({ date, startTime }, context) => {
  const now = new Date();
  const appointmentDate = parseISO(date);

  if (isBefore(appointmentDate, startOfToday())) {
    return;
  }

  const [hours, minutes] = startTime.split(":").map(Number);
  const appointmentDateTime = new Date(appointmentDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  if (appointmentDateTime <= now) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["startTime"],
      message: "La hora de inicio debe ser futura.",
    });
  }
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;