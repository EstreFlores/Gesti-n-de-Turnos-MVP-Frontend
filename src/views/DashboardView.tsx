import { StatsCards } from "@/features/appointments/components/StatsCards";
import type { Appointment, Service } from "@/types/appointment";
import type { AppointmentTableProps } from "@/features/appointments/components/AppointmentTable";
import { AppointmentListSection } from "@/views/AppointmentListSection";

interface DashboardViewProps {
  appointments: Appointment[];
  services: Service[];
  tableProps: AppointmentTableProps;
}

export function DashboardView({ appointments, services, tableProps }: DashboardViewProps) {
  return (
    <>
      <StatsCards appointments={appointments} services={services} />
      <AppointmentListSection
        title="Listado de Citas Programadas"
        subtitle="Actualizado en tiempo real"
        tableProps={tableProps}
      />
    </>
  );
}
