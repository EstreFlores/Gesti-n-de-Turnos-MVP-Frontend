import { Appointment, Service } from "@features/appointments/types/appointments";
import { INITIAL_APPOINTMENTS, MOCK_SERVICES } from "./mockAppointments";

const STORAGE_KEY = "zeewspace_salon_appointments";

export const appointmentService = {
  getServices: async (): Promise<Service[]> => {
    return MOCK_SERVICES;
  },

  getAppointments: async (): Promise<Appointment[]> => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    return JSON.parse(data);
  },

  createAppointment: async (newAppointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt" | "durationMinutes">): Promise<Appointment> => {
    const appointments = await appointmentService.getAppointments();
    const services = await appointmentService.getServices();
    
    const service = services.find(s => s.id === newAppointmentData.serviceId);
    const durationMinutes = service ? service.durationMinutes : 30;

    const newAppointment: Appointment = {
      ...newAppointmentData,
      id: `apt-${Date.now()}`,
      durationMinutes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newAppointment, ...appointments];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newAppointment;
  },

  updateAppointmentStatus: async (id: string, status: Appointment["status"]): Promise<Appointment> => {
    const appointments = await appointmentService.getAppointments();
    let updatedAppointment: Appointment | null = null;

    const updated = appointments.map(apt => {
      if (apt.id === id) {
        updatedAppointment = { ...apt, status, updatedAt: new Date().toISOString() };
        return updatedAppointment;
      }
      return apt;
    });

    if (!updatedAppointment) throw new Error("Cita no encontrada");

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updatedAppointment;
  },

  deleteAppointment: async (id: string): Promise<void> => {
    const appointments = await appointmentService.getAppointments();
    const filtered = appointments.filter(apt => apt.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};