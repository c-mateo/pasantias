import React from "react";

export default function ApplicationStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
    BLOCKED: { label: "Bloqueada", className: "bg-orange-100 text-orange-800" },
    ACCEPTED: { label: "Aceptada", className: "bg-green-100 text-green-800" },
    REJECTED: { label: "Rechazada", className: "bg-red-100 text-red-800" },
    CANCELLED: { label: "Cancelada", className: "bg-gray-100 text-gray-700" },
  };

  const info = map[status] ?? { label: status, className: "bg-gray-100 text-gray-700" };

  return (
    <span className={`inline-block rounded-xl px-3 py-1 text-sm font-medium ${info.className}`}>
      {info.label}
    </span>
  );
}
