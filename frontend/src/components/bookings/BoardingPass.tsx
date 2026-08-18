"use client";

import { formatDate } from "@/lib/format";
import type { Booking } from "@/lib/types";
import type { TripState } from "./TripModal";
import "./boardingpass.css";

export default function BoardingPass({
  booking,
  state,
  onEndTrip,
}: {
  booking: Booking;
  state: TripState | null;
  onEndTrip: () => void;
}) {
  const progress = state?.progress ?? 0;
  const done = booking.status === "completed";
  return (
    <div className="boardingpass-card animate-fade-in">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-base font-bold tracking-widest opacity-90">
              BOARDING PASS
            </div>
            <div className="text-xs opacity-60">
              Trip ID: {booking.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
          <div className="text-3xl animate-bounce">🚖</div>
        </div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-xs opacity-60">Pickup</div>
            <div className="text-lg font-semibold">{booking.pickup}</div>
          </div>
          <div className="mx-2 text-xl opacity-60">→</div>
          <div>
            <div className="text-xs opacity-60">Drop</div>
            <div className="text-lg font-semibold">{booking.drop}</div>
          </div>
        </div>
        <div className="relative w-full h-8 my-3">
          <div className="boardingpass-road opacity-80" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xl">🚕</div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xl">🏁</div>
          <div
            className={`boardingpass-car animate-car-bounce ${
              typeof progress === "number"
                ? `car-progress-${Math.round(progress * 80 + 10)}`
                : ""
            }`}
            style={{ left: `${progress * 80 + 10}%` }}
          >
            🚖
          </div>
        </div>
        <div className="flex justify-between mb-2 text-xs opacity-80">
          <div>
            Date: <span className="font-medium opacity-90">{formatDate(booking.date)}</span>
          </div>
          <div>
            Pickup: <span className="font-medium opacity-90">{booking.pickupTime || "--:--"}</span>
          </div>
          <div>
            Drop: <span className="font-medium opacity-90">{booking.dropTime || "--:--"}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mb-2 text-xs opacity-80">
          <div>
            Guest: <span className="font-medium opacity-90">{booking.guest}</span>
          </div>
          <div>
            Driver: <span className="font-medium opacity-90">{booking.driver}</span>
          </div>
          <div>
            Vehicle: <span className="font-medium opacity-90">
              {booking.vehicleType} - {booking.vehicleNumber}
            </span>
          </div>
          <div>
            Contact: <span className="font-medium opacity-90">{booking.contact}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-2 mt-3">
          <div>
            <div className="text-xs opacity-60">Live Kms</div>
            <div className="text-base font-bold">{state?.km?.toFixed(1) ?? "0.0"} km</div>
          </div>
          <div>
            <div className="text-xs opacity-60">Live Amount</div>
            <div className="text-base font-bold">₹{state?.amount ?? "0"}</div>
          </div>
          <div>
            <div className="text-xs opacity-60">Status</div>
            <div className="text-base font-bold text-yellow-200 animate-pulse">Ongoing</div>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="bg-purple-600 text-white px-6 py-2 rounded-lg shadow hover:bg-purple-700 text-base font-semibold transition animate-pulse"
            disabled={done}
            onClick={onEndTrip}
          >
            {done ? "Trip Ended" : "End Trip"}
          </button>
        </div>
      </div>
    </div>
  );
}