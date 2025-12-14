import React, { useMemo, useState, useRef } from "react";
import AdminTable from "./AdminTable";
import ActionButtons from "./ActionButtons";
import { Button } from "@heroui/button";
import { Modal } from "./Modal";

export type Header = {
  label: React.ReactNode;
  className?: string;
};

type AdminListProps<T> = {
  title?: string;
  items: T[];
  getId: (item: T) => number;
  getName?: (item: T) => string;
  headers?: Header[];
  renderCells: (item: T) => React.ReactNode;
  onDeleteItem?: (id: number) => void; // invoked after confirm
  onDeleteSelected?: (ids: number[]) => void; // invoked after confirm
  createHref?: string;
  loading?: boolean;
  sentinelRef?: React.RefObject<HTMLElement | null>;
};

export default function AdminList<T>({
  title,
  items,
  getId,
  getName,
  headers,
  renderCells,
  onDeleteItem,
  onDeleteSelected,
  createHref,
  loading,
  sentinelRef,
}: AdminListProps<T>) {
  const [selected, setSelected] = useState(() => new Set<number>());
  const [selectAllActive, setSelectAllActive] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; message: React.ReactNode; action: () => void }>({ isOpen: false, message: "", action: () => {} });
  const headerRef = useRef<HTMLInputElement | null>(null);

  // indeterminate checkbox
  React.useEffect(() => {
    if (!headerRef.current) return;
    const total = items.length;
    headerRef.current.indeterminate = selected.size > 0 && selected.size < total;
  }, [selected, items]);

  function toggleAll() {
    if (selected.size === items.length) {
      setSelected(new Set());
      setSelectAllActive(false);
    } else {
      const all = new Set(items.map(getId));
      setSelected(all);
      setSelectAllActive(true);
    }
  }

  function toggleOne(id: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      if (!checked && selectAllActive) setSelectAllActive(false);
      return next;
    });
  }

  const handleDeleteItem = (id: number) => () => {
    const name = items.find((it) => getId(it) === id);
    const displayName = name ? (getName ? getName(name) : String(getId(name))) : id.toString();
    setModal({
      isOpen: true,
      message: (
        <>
          {"¿Estás seguro de que deseas eliminar "}
          <b>{displayName}</b>
          {"? Esta acción no se puede deshacer."}
        </>
      ),
      action: () => {
        if (onDeleteItem) onDeleteItem(id);
        setModal({ ...modal, isOpen: false });
      },
    });
  };

  const handleDeleteSelected = () => {
    setModal({
      isOpen: true,
      message: (
        <>
          {"¿Estás seguro de que deseas eliminar las "}
          <b>{selected.size} seleccionadas</b>
          {"? Esta acción no se puede deshacer."}
        </>
      ),
      action: () => {
        const ids = Array.from(selected.values());
        if (onDeleteSelected) onDeleteSelected(ids);
        else if (onDeleteItem) ids.forEach((id) => onDeleteItem(id));
        setSelected(new Set());
        setModal({ ...modal, isOpen: false });
      },
    });
  };

  const combinedHeaders = useMemo(() => {
    const base = [
      {
        label: (
          <div className="flex items-center justify-center h-full">
            <input
        ref={headerRef}
        // header checkbox for select all
        type="checkbox"
        checked={selected.size === items.length && items.length > 0}
        onChange={() => toggleAll()}
        className="w-4 h-4"
        aria-label="Seleccionar todo"
            />
          </div>
        ),
        className: "px-4 py-2 border-b border-gray-300 text-center",
      },
    ];
    const passed = headers ?? [];
    return [...base, ...(passed as Header[]), { label: "Acciones", className: "px-4 py-2 text-center text-sm font-medium text-gray-900 border-b border-gray-300 w-24" }];
  }, [items, selected, headers]);

  return (
    <div>
      {title && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <div className="flex gap-2">
            {selected.size > 0 && (
              <Button color="danger" className="mr-4 inline-flex items-center justify-center px-4 py-2 rounded text-sm min-w-[140px]" onPress={handleDeleteSelected}>
                Eliminar Seleccionados ({selected.size})
              </Button>
            )}
            {createHref ? (
              <Button color="primary" className="inline-flex items-center justify-center px-4 py-2 rounded text-sm min-w-[140px]" onPress={() => (window.location.href = createHref)}>
                Crear
              </Button>
            ) : null}
          </div>
        </div>
      )}

      <AdminTable<T>
        headers={combinedHeaders}
        items={items}
        loading={!!loading}
        sentinelRef={sentinelRef}
        renderRow={(item, idx) => {
          const id = getId(item);
          return (
            <tr key={id} className="border-b border-gray-300">
              <td className="px-4 py-2 border-b border-gray-300 align-middle text-center">
                <input
                  type="checkbox"
                  checked={selected.has(id)}
                  onChange={(e) => toggleOne(id, e.target.checked)}
                  className="w-4 h-4"
                />
              </td>
              {renderCells(item)}
              <td className="px-3 py-2 text-sm text-gray-500 border-b border-gray-300 text-center align-middle">
                {/** Default actions: edit (navigate by href), delete */}
                <ActionButtons
                  onDelete={handleDeleteItem(id)}
                  editHref={createHref ? `${createHref.replace(/nuevo$/, "")}${id}` : undefined}
                />
              </td>
            </tr>
          );
        }}
      />

      <Modal isOpen={modal.isOpen} message={modal.message} onConfirm={modal.action} onCancel={() => setModal({ ...modal, isOpen: false })} />
    </div>
  );
}
