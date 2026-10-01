import type { AppointmentTableProps } from "@/components/AppointmentTable";
import { AppointmentListSection } from "@/views/AppointmentListSection";

interface AppointmentsViewProps {
  tableProps: AppointmentTableProps;
}

export function AppointmentsView({ tableProps }: AppointmentsViewProps) {
  return (
    <AppointmentListSection
      title="Gestión General de Citas & Turnos"
      tableProps={tableProps}
    />
  );
}
