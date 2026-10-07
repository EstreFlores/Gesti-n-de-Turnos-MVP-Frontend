import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppLoadingState } from "@/components/AppLoadingState";
import { CancelAppointmentDialog } from "@/components/CancelAppointmentDialog";
import { AppointmentModal } from "@/features/appointments/components/AppointmentModal";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { useAppointmentFilters } from "@/hooks/useAppointmentFilters";
import { AppointmentsView } from "@/views/AppointmentsView";
import { CalendarView } from "@/views/CalendarView";
import { DashboardView } from "@/views/DashboardView";
import { ServicesView } from "@/views/ServicesView";
import type { Appointment } from "@/types/appointment";

export default function App() {
  const { appointments, services, loading, loadError, retry, create, update, updateStatus, remove } =
    useAppointments();
  const filters = useAppointmentFilters(appointments);
  const [currentView, setCurrentView] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(() => window.localStorage.getItem("theme") === "dark");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const openNewAppointment = () => {
    setAppointmentToEdit(null);
    setIsModalOpen(true);
  };
  const handleEdit = (appointment: Appointment) => {
    setAppointmentToEdit(appointment);
    setIsModalOpen(true);
  };
  const handleSaveAppointment = (
    nextAppointment: Appointment,
    previousAppointment: Appointment | null
  ) => {
    if (previousAppointment) update(nextAppointment);
    else create(nextAppointment);
  };
  const handleStatusChange = (id: string, status: Appointment["status"]) => {
    if (status === "cancelled") {
      setAppointmentToCancel(appointments.find((appointment) => appointment.id === id) ?? null);
      return;
    }
    updateStatus(id, status);
  };
  const handleDelete = (id: string) => {
    const appointment = appointments.find((item) => item.id === id);
    if (appointment) remove(appointment);
  };
  const confirmCancellation = () => {
    if (!appointmentToCancel) return;
    updateStatus(appointmentToCancel.id, "cancelled");
    setAppointmentToCancel(null);
  };

  if (loading || loadError) {
    return <AppLoadingState loading={loading} onRetry={retry} />;
  }

  const tableProps = {
    appointments: filters.paginatedAppointments,
    services,
    onStatusChange: handleStatusChange,
    onDelete: handleDelete,
    onEdit: handleEdit,
    searchTerm: filters.searchTerm,
    selectedDate: filters.selectedDate,
    selectedStatus: filters.selectedStatus,
    currentPage: filters.currentPage,
    totalPages: filters.totalPages,
    totalFilteredAppointments: filters.totalFilteredAppointments,
    onSearchChange: filters.updateSearchTerm,
    onDateChange: filters.updateSelectedDate,
    onStatusFilterChange: filters.updateSelectedStatus,
    onPageChange: filters.setCurrentPage,
  };

  return (
    <>
      <AppLayout
        currentView={currentView}
        onViewChange={setCurrentView}
        isDarkMode={isDarkMode}
        onThemeChange={() => setIsDarkMode((current) => !current)}
        onNewAppointment={openNewAppointment}
      >
        {currentView === "dashboard" && (
          <DashboardView appointments={appointments} services={services} tableProps={tableProps} />
        )}
        {currentView === "appointments" && <AppointmentsView tableProps={tableProps} />}
        {currentView === "calendar" && (
          <CalendarView
            appointments={appointments}
            services={services}
            onNewAppointmentClick={openNewAppointment}
            onSelectAppointment={handleEdit}
          />
        )}
        {currentView === "services" && <ServicesView />}
      </AppLayout>
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAppointmentToEdit(null);
        }}
        services={services}
        existingAppointments={appointments}
        appointmentToEdit={appointmentToEdit}
        onSaveAppointment={handleSaveAppointment}
      />
      <CancelAppointmentDialog
        appointment={appointmentToCancel}
        onClose={() => setAppointmentToCancel(null)}
        onConfirm={confirmCancellation}
      />
    </>
  );
}
