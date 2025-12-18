import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import AdminTable from "./AdminTable";
import ActionButtons from "./ActionButtons";
import { Button } from "@heroui/button";
import { Modal } from "./Modal";
import {
  getKeyValue,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  type Selection,
  type SortDescriptor,
} from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { Navigate } from "react-router";
import { useNavigate } from "react-router";

export type Header = {
  label: React.ReactNode;
  name: string;
  alignment?: "start" | "center" | "end";
  className?: string;
  renderer?: (item: any) => React.ReactNode;
  sortable?: boolean;
};

type AdminListProps<T> = {
  title?: string;
  items: T[];
  getId: (item: T) => number;
  getName?: (item: T) => string;
  columns?: Header[];
  onDeleteItem?: (id: number) => void; // invoked after confirm
  onDeleteSelected?: (ids: number[]) => void; // invoked after confirm
  createHref?: string;
  loading?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
};

function indexBy<T>(array: T[], prop: keyof T): { [key: string]: T } {
  const index: { [key: string]: T } = {};
  array.forEach((item) => {
    index[item[prop] as unknown as string] = item;
  });
  return index;
}

export default function AdminList2<T extends { id: number }>({
  title,
  items,
  getId,
  getName,
  columns,
  onDeleteItem,
  onDeleteSelected,
  createHref,
  loading,
  hasMore,
  loadMore,
}: AdminListProps<T>) {
  const [selection, setSelection] = useState<Selection>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<
    SortDescriptor | undefined
  >(undefined);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    message: ReactNode;
    action: () => void;
  }>({ isOpen: false, message: "", action: () => {} });
  const headerRef = useRef<HTMLInputElement | null>(null);

  const selectedCount = selection === "all" ? items.length : selection.size;

  // indeterminate checkbox
  //   useEffect(() => {
  //     if (!headerRef.current) return;
  //     const total = items.length;
  //     headerRef.current.indeterminate =
  //       selectedCount > 0 && selectedCount < total;
  //   }, [selection, items]);

  const handleDeleteItem = (id: number) => () => {
    const name = items.find((it) => getId(it) === id);
    const displayName = name
      ? getName
        ? getName(name)
        : String(getId(name))
      : id.toString();
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
          <b>{selectedCount} seleccionadas</b>
          {"? Esta acción no se puede deshacer."}
        </>
      ),
      action: () => {
        const ids =
          selection === "all"
            ? items.map(getId)
            : Array.from(selection.values()).map(Number);
        if (onDeleteSelected) onDeleteSelected(ids);
        else if (onDeleteItem) ids.forEach((id) => onDeleteItem(id));
        setSelection(new Set());
        setModal({ ...modal, isOpen: false });
      },
    });
  };

  const columnSettings: Header[] = [
    ...(columns ?? []),
    {
      label: "Acciones",
      name: "actions",
      alignment: "center",
    },
  ];

  const columnLookup = indexBy<Header>(columnSettings, "name");

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: loadMore,
    shouldUseLoader: true,
  });

  const navigate = useNavigate();

  const sortedItems = items.sort((a, b) => {
    if (!sortDescriptor) return 0;
    const aValue = a[sortDescriptor.column];
    const bValue = b[sortDescriptor.column];

    const order = sortDescriptor.direction === "ascending" ? 1 : -1;

    if (typeof aValue === "number" && typeof bValue === "number") {
      return order * (aValue - bValue);
    }
    if (typeof aValue === "string" && typeof bValue === "string") {
      return order * aValue.localeCompare(bValue);
    }
    return 0
  });

  return (
    <div>
      <Table
        isHeaderSticky
        selectionMode="multiple"
        selectedKeys={selection}
        baseRef={scrollerRef}
        onSelectionChange={setSelection}
        aria-label="Administrar Carreras"
        className="h-[80vh]"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        bottomContent={
          hasMore ? (
            <div className="flex w-full justify-center">
              <Spinner ref={loaderRef} color="white" />
            </div>
          ) : null
        }
        topContentPlacement="outside"
        topContent={
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <div className="flex gap-2">
              {selectedCount > 0 && (
                <Button
                  color="danger"
                  className="mr-4 inline-flex items-center justify-center px-4 py-2 text-sm min-w-[140px]"
                  radius="md"
                  onPress={() => handleDeleteSelected()}
                >
                  Eliminar Seleccionados ({selectedCount})
                </Button>
              )}
              <Button
                color="primary"
                className="inline-flex items-center justify-center px-4 py-2 text-sm min-w-[140px]"
                radius="md"
                onPress={() => navigate("/admin/carreras/nuevo")}
              >
                Crear
              </Button>
            </div>
          </div>
        }
      >
        <TableHeader columns={columnSettings}>
          {(column) => (
            <TableColumn
              key={column.name?.toString() || ""}
              align={column.alignment}
              className={column.className || ""}
              allowsSorting={column.sortable}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          isLoading={loading}
          items={sortedItems}
          loadingContent={<Spinner label="Loading..." />}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => {
                if (columnKey === "actions") {
                  return (
                    <TableCell>
                      <ActionButtons
                        onDelete={handleDeleteItem(item.id)}
                        editHref={
                          createHref
                            ? createHref.replace(/nuevo$/, item.id.toString())
                            : undefined
                        }
                      />
                    </TableCell>
                  );
                }
                const renderer = columnLookup[columnKey].renderer;
                if (renderer)
                  return (
                    <TableCell>
                      {renderer(getKeyValue(item, columnKey))}
                    </TableCell>
                  );
                return <TableCell>{getKeyValue(item, columnKey)}</TableCell>;
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* 
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        onConfirm={modal.action}
        onCancel={() => setModal({ ...modal, isOpen: false })}
      /> */}
    </div>
  );
}
