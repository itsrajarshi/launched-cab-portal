"use client";

type BadgeTone = "slate" | "yellow" | "blue" | "green" | "red" | "indigo" | "purple";

const tones: Record<BadgeTone, string> = {
  slate: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
};

const bookingTone: Record<string, BadgeTone> = {
  pending: "yellow",
  upcoming: "blue",
  ongoing: "indigo",
  completed: "green",
  cancelled: "red",
  open_market: "purple",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = bookingTone[status] ?? "slate";
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${tones[tone]}`}>
      {status}
    </span>
  );
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const tone: BadgeTone = status === "received" ? "green" : "yellow";
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${tones[tone]}`}>
      {status}
    </span>
  );
}