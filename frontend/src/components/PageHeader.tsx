"use client";

import { ReactNode } from "react";

export default function PageHeader({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}