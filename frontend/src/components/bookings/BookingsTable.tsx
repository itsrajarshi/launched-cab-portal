"use client";

import { ReactNode } from "react";
import EmptyState from "@/components/EmptyState";
import ErrorBanner from "@/components/ErrorBanner";
import { TableSkeleton } from "@/components/TableSkeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";
import type { Booking } from "@/lib/types";

const thClass =
  "px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 border-b border-blue-100 dark:border-gray-800 bg-blue-50/70 dark:bg-gray-800";
const tdClass = "px-3 py-3 border-b border-gray-100 dark:border-gray-800";

export default function BookingsTable({
  variant,
  bookings,
  loading,
  error,
  actions,
}: {
  variant: "vendor" | "company";
  bookings: Booking[];
  loading: boolean;
  error?: string | null;
  actions?: (booking: Booking) => ReactNode;
}) {
  const colSpan = variant === "company" ? 11 : 9;
  return (
    <div className="overflow-x-auto rounded-xl border border-blue-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900/90 dark:text-white">
      {error && <ErrorBanner message={error} />}
      <table className="min-w-full border-0 rounded-xl">
        <thead>
          <tr>
            <th className={thClass}>Guest</th>
            <th className={thClass}>Date</th>
            <th className={thClass}>Pickup</th>
            <th className={thClass}>Drop</th>
            <th className={thClass}>Category</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Driver</th>
            <th className={thClass}>Vehicle</th>
            {variant === "company" && <th className={thClass}>Company</th>}
            {variant === "company" && <th className={thClass}>Total Amount</th>}
            <th className={thClass}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <TableSkeleton cols={colSpan} />
          ) : bookings.length === 0 ? (
            <EmptyState message="No bookings found." colSpan={colSpan} />
          ) : (
            bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-blue-50/60 dark:hover:bg-blue-900/40 transition-colors">
                <td className={tdClass}>{booking.guest}</td>
                <td className={tdClass}>{formatDate(booking.date)}</td>
                <td className={tdClass}>{booking.pickup}</td>
                <td className={tdClass}>{booking.drop}</td>
                <td className={tdClass}>{booking.category}</td>
                <td className={tdClass}>
                  <StatusBadge status={booking.status} />
                </td>
                <td className={tdClass}>{booking.driver || "Not assigned"}</td>
                <td className={tdClass}>
                  {booking.vehicleType} - {booking.vehicleNumber}
                </td>
                {variant === "company" && <td className={tdClass}>{booking.company}</td>}
                {variant === "company" && (
                  <td className={tdClass}>₹{booking.totalAmount || "-"}</td>
                )}
                <td className={tdClass}>{actions?.(booking)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}