export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone?: string;
  serviceId: string;
  date: string; // Formato: YYYY-MM-DD
  startTime: string; // Formato: HH:mm
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}