"use client";

import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/80 dark:bg-gray-900/90 border border-blue-100 dark:border-gray-700 shadow-[0_4px_24px_0_rgba(31,41,55,0.08)] backdrop-blur-md transition-colors ${className}`}
    >
      {children}
    </div>
  );
}