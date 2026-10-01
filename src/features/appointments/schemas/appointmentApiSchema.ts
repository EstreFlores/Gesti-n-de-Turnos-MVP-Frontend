import { z } from "zod";
import { PROFESSIONALS } from "@/features/appointments/data/professionals";

export const serviceApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationMinutes: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative(),
});

export const appointmentApiSchema = z.object({
  id: z.string(),
  clientName: z.string(),
  clientPhone: z.string().nullish().transform((phone) => phone ?? undefined),
  serviceId: z.string(),
  professionalId: z.string().min(1).nullish().transform(
    (professionalId) => professionalId ?? PROFESSIONALS[0].id
  ),
  date: z.string(),
  startTime: z.string(),
  durationMinutes: z.coerce.number().int().positive(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
  notes: z.string().nullish().transform((notes) => notes ?? undefined),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const servicesApiSchema = z.array(serviceApiSchema);
export const appointmentsApiSchema = z.array(appointmentApiSchema);
