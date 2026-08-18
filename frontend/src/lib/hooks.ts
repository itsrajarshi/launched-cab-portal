"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createBooking,
  createDriver,
  createInvoice,
  createVehicle,
  deleteBooking,
  deleteDriver,
  deleteInvoice,
  deleteVehicle,
  endTrip,
  fetchBookings,
  fetchDrivers,
  fetchInvoices,
  fetchVehicles,
  startTrip,
  updateBooking,
  updateDriver,
  updateInvoice,
  updateVehicle,
} from "./api";
import type {
  Booking,
  BookingInput,
  Driver,
  DriverInput,
  Invoice,
  InvoiceInput,
  Vehicle,
  VehicleInput,
} from "./types";

export const queryKeys = {
  bookings: ["bookings"] as const,
  drivers: ["drivers"] as const,
  vehicles: ["vehicles"] as const,
  invoices: ["invoices"] as const,
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Request failed";
}

// --- Queries ---

export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings,
    queryFn: fetchBookings,
  });
}

export function useDrivers() {
  return useQuery({
    queryKey: queryKeys.drivers,
    queryFn: fetchDrivers,
  });
}

export function useVehicles() {
  return useQuery({
    queryKey: queryKeys.vehicles,
    queryFn: fetchVehicles,
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: queryKeys.invoices,
    queryFn: fetchInvoices,
  });
}

// --- Mutations: bookings ---

type BookingVariables = { id: string; data: Partial<BookingInput> };

export function useCreateBooking() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BookingInput>) => createBooking(data),
    onSuccess: (created) => {
      client.setQueryData<Booking[]>(queryKeys.bookings, (old = []) => [
        ...old,
        created,
      ]);
      toast.success("Booking created");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useUpdateBooking() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: BookingVariables) => updateBooking(id, data),
    onSuccess: (updated) => {
      client.setQueryData<Booking[]>(queryKeys.bookings, (old = []) =>
        old.map((row) => (row.id === updated.id ? updated : row))
      );
      toast.success("Booking updated");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useDeleteBooking() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBooking(id),
    onSuccess: (_data, id) => {
      client.setQueryData<Booking[]>(queryKeys.bookings, (old = []) =>
        old.filter((row) => row.id !== id)
      );
      toast.success("Booking deleted");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useStartTrip() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => startTrip(id),
    onSuccess: (updated) => {
      client.setQueryData<Booking[]>(queryKeys.bookings, (old = []) =>
        old.map((row) => (row.id === updated.id ? updated : row))
      );
      toast.success("Trip started");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useEndTrip() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => endTrip(id),
    onSuccess: (updated) => {
      client.setQueryData<Booking[]>(queryKeys.bookings, (old = []) =>
        old.map((row) => (row.id === updated.id ? updated : row))
      );
      toast.success("Trip ended");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

// --- Mutations: drivers ---

type DriverVariables = { id: string; data: Partial<DriverInput> };

export function useCreateDriver() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DriverInput>) => createDriver(data),
    onSuccess: (created) => {
      client.setQueryData<Driver[]>(queryKeys.drivers, (old = []) => [
        ...old,
        created,
      ]);
      toast.success("Driver added");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useUpdateDriver() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: DriverVariables) => updateDriver(id, data),
    onSuccess: (updated) => {
      client.setQueryData<Driver[]>(queryKeys.drivers, (old = []) =>
        old.map((row) => (row.id === updated.id ? updated : row))
      );
      toast.success("Driver updated");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useDeleteDriver() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDriver(id),
    onSuccess: (_data, id) => {
      client.setQueryData<Driver[]>(queryKeys.drivers, (old = []) =>
        old.filter((row) => row.id !== id)
      );
      toast.success("Driver deleted");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

// --- Mutations: vehicles ---

type VehicleVariables = { id: string; data: Partial<VehicleInput> };

export function useCreateVehicle() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<VehicleInput>) => createVehicle(data),
    onSuccess: (created) => {
      client.setQueryData<Vehicle[]>(queryKeys.vehicles, (old = []) => [
        ...old,
        created,
      ]);
      toast.success("Vehicle added");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useUpdateVehicle() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: VehicleVariables) => updateVehicle(id, data),
    onSuccess: (updated) => {
      client.setQueryData<Vehicle[]>(queryKeys.vehicles, (old = []) =>
        old.map((row) => (row.id === updated.id ? updated : row))
      );
      toast.success("Vehicle updated");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useDeleteVehicle() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: (_data, id) => {
      client.setQueryData<Vehicle[]>(queryKeys.vehicles, (old = []) =>
        old.filter((row) => row.id !== id)
      );
      toast.success("Vehicle deleted");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

// --- Mutations: invoices ---

type InvoiceVariables = { id: string; data: Partial<InvoiceInput> };

export function useCreateInvoice() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<InvoiceInput>) => createInvoice(data),
    onSuccess: (created) => {
      client.setQueryData<Invoice[]>(queryKeys.invoices, (old = []) => [
        ...old,
        created,
      ]);
      toast.success("Invoice submitted");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useUpdateInvoice() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: InvoiceVariables) => updateInvoice(id, data),
    onSuccess: (updated) => {
      client.setQueryData<Invoice[]>(queryKeys.invoices, (old = []) =>
        old.map((row) => (row.id === updated.id ? updated : row))
      );
      toast.success("Invoice updated");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useDeleteInvoice() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: (_data, id) => {
      client.setQueryData<Invoice[]>(queryKeys.invoices, (old = []) =>
        old.filter((row) => row.id !== id)
      );
      toast.success("Invoice deleted");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}