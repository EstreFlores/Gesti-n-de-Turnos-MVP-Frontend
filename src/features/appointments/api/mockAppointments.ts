import { Appointment, Service } from "@features/appointments/types/appointments";
export const MOCK_SERVICES: Service[] = [
  { id: "srv-1", name: "Corte de Cabello (Dama/Caballero)", durationMinutes: 45, price: 250 },
  { id: "srv-2", name: "Tinte / Balayage", durationMinutes: 120, price: 950 },
  { id: "srv-3", name: "Manicure y Pedicure", durationMinutes: 60, price: 400 },
  { id: "srv-4", name: "Maquillaje y Peinado", durationMinutes: 90, price: 650 },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1",
    clientName: "Sofía Valentina",
    clientPhone: "5512345678",
    serviceId: "srv-2",
    date: "2026-09-25",
    startTime: "10:00",
    durationMinutes: 120,
    status: "confirmed",
    notes: "Traer referencia de color para el balayage.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "apt-2",
    clientName: "Maidel Gómez",
    clientPhone: "5587654321",
    serviceId: "srv-3",
    date: "2026-09-25",
    startTime: "13:00",
    durationMinutes: 60,
    status: "pending",
    notes: "Efecto gelish en uñas.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "apt-3",
    clientName: "Camila Ruiz",
    clientPhone: "5598765432",
    serviceId: "srv-1",
    date: "2026-09-26",
    startTime: "16:00",
    durationMinutes: 45,
    status: "completed",
    notes: "Corte en capas.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    id: "apt-4",
    clientName: "Yandel Gómez",
    clientPhone: "5598765432",
    serviceId: "srv-1",
    date: "2026-09-26",
    startTime: "16:00",
    durationMinutes: 45,
    status: "completed",
    notes: "Corte de pelo.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },


];