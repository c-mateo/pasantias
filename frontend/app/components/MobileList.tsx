import React from "react";

/**
 * MobileList
 *
 * A small, reusable component to render lists on mobile as compact cards (like a contacts list).
 * - No more than 3 fields are expected: primary (title), secondary (subtitle), tertiary (meta/right)
 * - Keep it simple: developers can pass renderers for each slot
 *
 * Usage example:
 * <MobileList
 *   items={users}
 *   getId={(u) => u.id}
 *   getPrimary={(u) => `${u.firstName} ${u.lastName}`}
 *   getSecondary={(u) => u.email}
 *   getTertiary={(u) => formatDateTimeLocal(u.createdAt)}
 *   onItemClick={(u) => navigate(`/admin/usuarios/${u.id}`)}
 * />
 */

export type MobileListProps<T> = {
  items: T[];
  getId: (item: T) => number | string;
  getPrimary: (item: T) => React.ReactNode;
  getSecondary?: (item: T) => React.ReactNode;
  getTertiary?: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
  emptyState?: React.ReactNode;
  className?: string;
};

export default function MobileList<T>({
  items,
  getId,
  getPrimary,
  getSecondary,
  getTertiary,
  onItemClick,
  emptyState,
  className,
}: MobileListProps<T>) {
  if (!items || items.length === 0) {
    return (
      <div className={"p-4 text-center text-sm text-gray-500 " + (className ?? "")}>{emptyState ?? "No hay elementos"}</div>
    );
  }

  return (
    <ul className={"space-y-2 " + (className ?? "")}> 
      {items.map((it) => {
        const key = getId(it);
        return (
          <li key={String(key)}>
            <button
              type="button"
              onClick={() => onItemClick && onItemClick(it)}
              className="w-full text-left bg-white border border-gray-200 rounded p-3 flex items-center justify-between gap-3 hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{getPrimary(it)}</div>
                {getSecondary && <div className="text-xs text-gray-600 truncate">{getSecondary(it)}</div>}
              </div>

              {getTertiary && <div className="text-xs text-gray-400 ml-3 whitespace-nowrap">{getTertiary(it)}</div>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
