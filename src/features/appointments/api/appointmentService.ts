import type { Appointment, Service } from "@/types/appointment";
import {
  appointmentApiSchema,
  appointmentsApiSchema,
  servicesApiSchema,
} from "@/features/appointments/schemas/appointmentApiSchema";

const API_BASE_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");

const getApiUrl = (path: string) => {
  if (!API_BASE_URL) {
    throw new Error(
      "Falta configurar VITE_API_URL en .env.local. Usa .env.example como plantilla y reinicia Vite."
    );
  }

  return `${API_BASE_URL}${path}`;
};


const parseJsonResponse = async <T,>(
  response: Response,
  schema: { parse: (value: unknown) => T },
  errorMessage: string
): Promise<T> => {
  if (!response.ok) throw new Error(errorMessage);
  return schema.parse(await response.json());
};

export const appointmentService = {
  // GET /services
  getServices: async (): Promise<Service[]> => {
    const response = await fetch(getApiUrl("/services"));
    return parseJsonResponse(response, servicesApiSchema, "Error al obtener los servicios");
  },

  // GET /appointments
  getAppointments: async (): Promise<Appointment[]> => {
    const response = await fetch(getApiUrl("/appointments"));
    return parseJsonResponse(response, appointmentsApiSchema, "Error al obtener las citas");
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

    const response = await fetch(getApiUrl("/appointments"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return parseJsonResponse(response, appointmentApiSchema, "Error al crear la cita");
  },

  updateAppointment: async (
    id: string,
    appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">
  ): Promise<Appointment> => {
    const response = await fetch(getApiUrl(`/appointments/${encodeURIComponent(id)}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...appointmentData,
        updatedAt: new Date().toISOString(),
      }),
    });

    return parseJsonResponse(response, appointmentApiSchema, "Error al actualizar la cita");
  },

  // PUT /appointments/:id (Actualizar estado)
  updateAppointmentStatus: async (id: string, status: Appointment["status"]): Promise<Appointment> => {
    const response = await fetch(getApiUrl(`/appointments/${encodeURIComponent(id)}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        updatedAt: new Date().toISOString(),
      }),
    });

    return parseJsonResponse(response, appointmentApiSchema, "Error al actualizar el estado de la cita");
  },

  // DELETE /appointments/:id
  deleteAppointment: async (id: string): Promise<void> => {
    const response = await fetch(getApiUrl(`/appointments/${encodeURIComponent(id)}`), {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Error al eliminar la cita");
  }
};