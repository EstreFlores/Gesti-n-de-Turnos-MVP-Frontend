import { AppointmentTable, type AppointmentTableProps } from "@/features/appointments/components/AppointmentTable";

interface AppointmentListSectionProps {
  title: string;
  subtitle?: string;
  tableProps: AppointmentTableProps;
}

export function AppointmentListSection({ title, subtitle, tableProps }: AppointmentListSectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <span className="text-xs font-medium text-slate-400">{subtitle}</span>}
      </div>
      <AppointmentTable {...tableProps} />
    </section>
  );
}
