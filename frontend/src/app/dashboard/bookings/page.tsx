"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import BookingForm from "@/components/bookings/BookingForm";
import AssignForm from "@/components/bookings/AssignForm";
import BookingsTable from "@/components/bookings/BookingsTable";
import TripModal from "@/components/bookings/TripModal";
import BoardingPass from "@/components/bookings/BoardingPass";
import {
  useBookings,
  useCreateBooking,
  useUpdateBooking,
  useDeleteBooking,
  useStartTrip,
  useEndTrip,
  useCreateInvoice,
} from "@/lib/hooks";
import { exportBookingsCsv, safeTimestamp } from "@/lib/format";
import { useBookingsRealtime } from "@/lib/realtime";
import type { Booking } from "@/lib/types";

export default function BookingsPage() {
  const { user } = useAuth();
  useBookingsRealtime();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Booking> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const { data: bookings = [], isLoading: loading, refetch } = useBookings();
  const createBookingMutation = useCreateBooking();
  const updateBookingMutation = useUpdateBooking();
  const deleteBookingMutation = useDeleteBooking();
  const startTripMutation = useStartTrip();
  const endTripMutation = useEndTrip();
  const createInvoiceMutation = useCreateInvoice();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<{ id: string } | null>(null);
  const [tripModal, setTripModal] = useState<{ id: string } | null>(null);
  const [tripModalState, setTripModalState] = useState<{
    km: number;
    amount: number;
    progress: number;
    running: boolean;
  } | null>(null);

  useEffect(() => {
    refetch();
  }, [user, refetch]);

  async function handleAdd(data: Partial<Booking>) {
    const bookingData = {
      ...data,
      status: "pending",
      company: data.company || "Unknown Company",
      guest: data.guest || "Unknown Guest",
      contact: data.contact || "Unknown Contact",
      category: data.category || "Sedan",
      date: data.date || new Date().toISOString().slice(0, 10),
      pickup: data.pickup || "Unknown Pickup",
      drop: data.drop || "Unknown Drop",
    };
    await createBookingMutation.mutateAsync(bookingData);
  }

  async function handleEdit(data: Partial<Booking>) {
    if (!data.id) return;
    await updateBookingMutation.mutateAsync({ id: data.id, data });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteBookingMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }

  async function handlePlaceInOpenMarket(id: string) {
    await updateBookingMutation.mutateAsync({ id, data: { status: "open_market" } });
  }

  async function handleAssign(id: string, driver: string, vehicleType: string, vehicleNumber: string) {
    setAcceptingId(id);
    try {
      const prev = bookings.find((b) => b.id === id);
      await updateBookingMutation.mutateAsync({
        id,
        data: {
          status: "upcoming",
          driver,
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,
          company: prev?.company || "Unknown Company",
          guest: prev?.guest || "Unknown Guest",
          contact: prev?.contact || "Unknown Contact",
          category: prev?.category || "Sedan",
          date: prev?.date || new Date().toISOString().slice(0, 10),
          pickup: prev?.pickup || "Unknown Pickup",
          drop: prev?.drop || "Unknown Drop",
        },
      });
      setAssignModal(null);
    } catch {
      alert("Failed to assign driver/vehicle. Please try again.");
    } finally {
      setAcceptingId(null);
    }
  }

  async function handleStartTrip(id: string) {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;
    setTripModal({ id });
    setTripModalState({ km: 0, amount: 0, progress: 0, running: true });
    await startTripMutation.mutateAsync(id);
  }

  async function handleEndTripModal(id: string) {
    setTripModal(null);
    setTripModalState(null);
    await endTripMutation.mutateAsync(id);
    const booking = bookings.find((b) => b.id === id);
    if (booking && booking.company && booking.id && (tripModalState?.amount || booking.totalAmount)) {
      const invoiceData = {
        bookingId: booking.id,
        invoiceNumber: `INV-${booking.id}`,
        company: booking.company,
        amount: Number(tripModalState?.amount || booking.totalAmount || 600),
        status: "received" as const,
        date: booking.date,
        month: booking.date?.slice(0, 7) || "",
      };
      try {
        await createInvoiceMutation.mutateAsync(invoiceData);
      } catch {
        // invoice creation is best-effort after a trip ends
      }
    } else {
      alert("Cannot create invoice: booking is missing company, amount, or other required fields.");
    }
  }

  function handleRefresh() {
    refetch();
  }

  const filteredBookings = [...bookings].sort(
    (a, b) => safeTimestamp(a.date) - safeTimestamp(b.date)
  );

  // Animation effect for trip modal
  useEffect(() => {
    if (!tripModal || !tripModalState?.running) return;
    let t = 0;
    const interval = setInterval(() => {
      t++;
      setTripModalState((prev) =>
        prev
          ? {
              ...prev,
              km: t * 1.2,
              amount: t * 60,
              progress: t / 10,
              running: t < 10,
            }
          : prev
      );
      if (t >= 10) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [tripModal, tripModalState?.running]);

  const isVendor = user?.role === "vendor";

  return (
    <div className="p-4">
      <PageHeader title="Bookings" />
      <div className="flex flex-wrap gap-4 mb-4">
        {user?.role === "company" && (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Booking
          </button>
        )}
        <button
          onClick={() => exportBookingsCsv(bookings)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Export CSV
        </button>
        <button
          onClick={handleRefresh}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      <BookingsTable
        variant={isVendor ? "vendor" : "company"}
        bookings={filteredBookings}
        loading={loading}
        actions={(booking) =>
          isVendor ? (
            <>
              {booking.status === "pending" && (
                <>
                  <button
                    onClick={() => setAssignModal({ id: booking.id })}
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 mr-1 disabled:opacity-50"
                    disabled={acceptingId === booking.id}
                  >
                    {acceptingId === booking.id ? "Accepting..." : "Accept & Assign"}
                  </button>
                  <button
                    onClick={() => handlePlaceInOpenMarket(booking.id)}
                    className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                  >
                    Open Market
                  </button>
                </>
              )}
              {booking.status === "upcoming" && (
                <button
                  onClick={() => handleStartTrip(booking.id)}
                  className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                  Start Trip
                </button>
              )}
              {booking.status === "ongoing" && (
                <span className="text-yellow-700 mr-2">Ongoing...</span>
              )}
              {booking.status === "completed" && (
                <span className="text-green-700 font-semibold">
                  Completed (₹{booking.totalAmount || 600})
                </span>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditData(booking);
                  setModalOpen(true);
                }}
                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-1"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteTarget(booking)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </>
          )
        }
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editData ? "Edit Booking" : "New Booking"}
      >
        <BookingForm
          onClose={() => setModalOpen(false)}
          onSubmit={editData ? handleEdit : handleAdd}
          initial={editData || undefined}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Booking"
        message={`Delete booking for ${deleteTarget?.guest ?? "this guest"}? This cannot be undone.`}
        busy={deleteBookingMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <Modal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Assign Driver & Vehicle"
      >
        {assignModal && (
          <AssignForm
            onAssign={(driver, vehicleType, vehicleNumber) =>
              handleAssign(assignModal.id, driver, vehicleType, vehicleNumber)
            }
            onClose={() => setAssignModal(null)}
          />
        )}
      </Modal>

      <TripModal
        booking={bookings.find((b) => b.id === tripModal?.id)}
        state={tripModalState}
        onClose={() => {}}
        onEndTrip={handleEndTripModal}
      />

      {isVendor &&
        (() => {
          const ongoing = bookings.find((b) => b.status === "ongoing");
          if (!ongoing) return null;
          const handleEndTripClick = async () => {
            if (ongoing.status === "completed") return;
            await handleEndTripModal(ongoing.id);
            setTripModalState((prev) =>
              prev ? { ...prev, running: false, progress: 1 } : prev
            );
            const card = document.querySelector(".boardingpass-card");
            if (card) {
              card.classList.add("animate-fade-out");
              setTimeout(() => card.classList.add("hidden"), 700);
            }
          };
          return (
            <BoardingPass
              booking={ongoing}
              state={tripModalState}
              onEndTrip={handleEndTripClick}
            />
          );
        })()}
    </div>
  );
}