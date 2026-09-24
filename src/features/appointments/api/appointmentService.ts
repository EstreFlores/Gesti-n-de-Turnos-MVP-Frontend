import type { Appointment, Service } from  "@/types/appointment";

const API_BASE_URL = "https://6ab3f4b1217e436588318291.mockapi.io";

export const appointmentService = {
  // GET /services
  getServices: async (): Promise<Service[]> => {
    const response = await fetch(`${API_BASE_URL}/services`);
    if (!response.ok) throw new Error("Error al obtener los servicios");
    return response.json();
  },

  // GET /appointments
  getAppointments: async (): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/appointments`);
    if (!response.ok) throw new Error("Error al obtener las citas");
    return response.json();
  },

  // POST /appointments
  createAppointment: async (newAppointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt" | "durationMinutes">): Promise<Appointment> => {
   
    //aqui se obtienen los servicios para calcular la duración automáticamente
    const services = await appointmentService.getServices();
    const service = services.find(s => s.id === newAppointmentData.serviceId);
    const durationMinutes = service ? service.durationMinutes : 30;

    const payload = {
      ...newAppointmentData,
      durationMinutes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Error al crear la cita");
    return response.json();
  },

  updateAppointment: async (
    id: string,
    appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">
  ): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...appointmentData,
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error("Error al actualizar la cita");
    return response.json();
  },

  // PUT /appointments/:id (Actualizar estado)
  updateAppointmentStatus: async (id: string, status: Appointment["status"]): Promise<Appointment> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error("Error al actualizar el estado de la cita");
    return response.json();
  },

  // DELETE /appointments/:id
  deleteAppointment: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Error al eliminar la cita");
  }
};