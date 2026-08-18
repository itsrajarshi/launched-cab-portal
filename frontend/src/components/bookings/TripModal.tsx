"use client";

import Modal from "@/components/Modal";
import type { Booking } from "@/lib/types";

export type TripState = {
  km: number;
  amount: number;
  progress: number;
  running: boolean;
};

export default function TripModal({
  booking,
  state,
  onClose,
  onEndTrip,
}: {
  booking: Booking | undefined;
  state: TripState | null;
  onClose: () => void;
  onEndTrip: (id: string) => void;
}) {
  if (!booking || !state) return null;
  return (
    <Modal open={!!booking && !!state} onClose={onClose} title="Trip in Progress">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-full flex justify-between text-sm mb-2">
          <span>
            Pickup: <b>{booking.pickup}</b>
          </span>
          <span>
            Drop: <b>{booking.drop}</b>
          </span>
        </div>
        <div className="relative w-full h-16 bg-gray-200 dark:bg-gray-800 rounded">
          <div className="absolute left-0 top-1/2 -translate-y-1/2">🚕</div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">🏁</div>
          <div
            className="absolute top-1/2 -translate-y-1/2 trip-car"
            data-progress={state.progress}
          >
            <span className="trip-car-icon">🚖</span>
          </div>
        </div>
        <div className="flex justify-between w-full text-lg">
          <span>
            Kms: <b>{state.km.toFixed(1)}</b>
          </span>
          <span>
            Amount: <b>₹{state.amount}</b>
          </span>
        </div>
        <div className="w-full flex flex-col gap-1 text-sm">
          <span>
            Driver: <b>{booking.driver}</b>
          </span>
          <span>
            Vehicle: <b>
              {booking.vehicleType} - {booking.vehicleNumber}
            </b>
          </span>
          <span>
            Contact: <b>{booking.contact}</b>
          </span>
        </div>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mt-4"
          onClick={() => onEndTrip(booking.id)}
        >
          End Trip
        </button>
      </div>
    </Modal>
  );
}