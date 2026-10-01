import { useEffect, useMemo, useState } from "react";
import type { Appointment } from "@/types/appointment";

const getInitialStatus = (): Appointment["status"] | "all" => {
  const status = new URLSearchParams(window.location.search).get("status");
  return status === "pending" || status === "confirmed" || status === "cancelled" || status === "completed"
    ? status
    : "all";
};

export function useAppointmentFilters(appointments: Appointment[]) {
  const [searchTerm, setSearchTerm] = useState(() =>
    new URLSearchParams(window.location.search).get("search") ?? ""
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    new URLSearchParams(window.location.search).get("date") ?? ""
  );
  const [selectedStatus, setSelectedStatus] = useState<Appointment["status"] | "all">(getInitialStatus);
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesName = appointment.clientName.toLowerCase().includes(normalizedSearch);
      const matchesDate = !selectedDate || appointment.date === selectedDate;
      const matchesStatus = selectedStatus === "all" || appointment.status === selectedStatus;
      return matchesName && matchesDate && matchesStatus;
    });
  }, [appointments, searchTerm, selectedDate, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / appointmentsPerPage));
  const displayedPage = Math.min(currentPage, totalPages);
  const paginatedAppointments = filteredAppointments.slice(
    (displayedPage - 1) * appointmentsPerPage,
    displayedPage * appointmentsPerPage
  );

  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  const updateSelectedDate = (value: string) => {
    setSelectedDate(value);
    setCurrentPage(1);
  };
  const updateSelectedStatus = (value: Appointment["status"] | "all") => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedDate) params.set("date", selectedDate);
    if (selectedStatus !== "all") params.set("status", selectedStatus);

    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`
    );
  }, [searchTerm, selectedDate, selectedStatus]);

  return {
    searchTerm,
    selectedDate,
    selectedStatus,
    currentPage: displayedPage,
    totalPages,
    totalFilteredAppointments: filteredAppointments.length,
    paginatedAppointments,
    setCurrentPage,
    updateSearchTerm,
    updateSelectedDate,
    updateSelectedStatus,
  };
}
