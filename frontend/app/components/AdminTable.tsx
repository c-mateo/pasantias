import React from "react";

type Header = {
  label: React.ReactNode;
  className?: string;
};

type AdminTableProps<T> = {
  headers: Header[];
  items: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  sentinelRef?: React.RefObject<HTMLElement | null>;
  tableClassName?: string;
  sticky?: boolean;
  colSpan?: number;
};

export default function AdminTable<T>({
  headers,
  items,
  renderRow,
  loading,
  sentinelRef,
  tableClassName = "w-full h-20 border-separate border-spacing-0",
  sticky = true,
  colSpan,
}: AdminTableProps<T>) {
  const span = colSpan ?? headers.length;

  return (
    <div className="flex rounded-xl border border-gray-300 bg-white shadow-md overflow-y-auto max-h-[550px] scrollbar-none">
      <table className={tableClassName}>
        <thead className={`bg-gray-100 ${sticky ? "sticky top-0 z-40" : ""}`}>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={h.className ?? "px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-300"}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => renderRow(item, i))}
          {loading && (
            <tr>
              <td colSpan={span} className="border-t border-gray-300 text-center py-4">
                Cargando…
              </td>
            </tr>
          )}
          <tr ref={sentinelRef as any}>
            <td colSpan={span}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
