import type { Service } from "@/types/appointment";

export const getServiceById = (services: Service[], serviceId: string) =>
  services.find((service) => service.id === serviceId);

export const getServiceName = (
  services: Service[],
  serviceId: string,
  fallback = "Servicio"
) => getServiceById(services, serviceId)?.name ?? fallback;
