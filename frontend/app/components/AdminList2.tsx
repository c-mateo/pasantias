import { useState, useRef, useEffect, type ReactNode } from "react";
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
import { createSetters } from "~/util/createSetters";

export type Header = {
  label: ReactNode;
  name: string;
  alignment?: "start" | "center" | "end";
  className?: string;
  renderer?: (value: any) => ReactNode;
  sortable?: boolean;
};

type RowContext = {
    createHref?: string;
    handleDeleteItem: () => void;
};

type RowActions = (item: any, ctx: RowContext) => ReactNode;

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
  canCreate?: boolean;
  canDelete?: boolean;
  loadMore?: () => void;
  rowActions?: RowActions;
};

function indexBy<T>(array: T[], prop: keyof T): { [key: string]: T } {
  const index: { [key: string]: T } = {};
  array.forEach((item) => {
    index[item[prop] as unknown as string] = item;
  });
  return index;
}

const defaultActions: RowActions = (item, { createHref, handleDeleteItem }) => {
  return (
    <ActionButtons
      onDelete={() => { console.log('Deleting item:', item.id); handleDeleteItem()}}
      editHref={
        createHref
          ? createHref.replace(/nuevo$/, item.id.toString())
          : undefined
      }
    />
)};

export default function AdminList2<
  T extends { id: number } & Record<string, any>,
>({
  title,
  items,
  getId,
  getName,
  columns,
  onDeleteItem,
  onDeleteSelected,
  createHref,
  loading,
  canCreate,
  canDelete,
  hasMore,
  loadMore,
  rowActions = defaultActions,
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

  const selectedCount = selection === "all" ? items.length : selection.size;

  const { setIsOpen } = createSetters(setModal);

  const getDisplayName = (item: T | undefined) => {
    if (!item) return "";
    return getName ? getName(item) : String(getId(item));
  };

  const createDeleteItemHandler = (id: number) => () => {
    console.log('Deleting item:', id);
    const name = items.find((it) => getId(it) === id);
    const displayName = getDisplayName(name);
    console.log('Deleting item:', displayName);
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
        setIsOpen(false);
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
    return 0;
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
              {canDelete && selectedCount > 0 && (
                <Button
                  color="danger"
                  className="mr-4 inline-flex items-center justify-center px-4 py-2 text-sm min-w-[140px]"
                  radius="md"
                  onPress={() => handleDeleteSelected()}
                >
                  Eliminar Seleccionados ({selectedCount})
                </Button>
              )}
              {canCreate && createHref && (
                <Button
                  color="primary"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm min-w-[140px]"
                  radius="md"
                  onPress={() => navigate(createHref)}
                >
                  Crear
                </Button>
              )}
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
                  return <TableCell>{rowActions(item, { createHref, handleDeleteItem: createDeleteItemHandler(item.id) })}</TableCell>;
                }
                const renderer = columnLookup[columnKey].renderer;
                const value = getKeyValue(item, columnKey);
                return (
                  <TableCell>{renderer ? renderer(value) : value}</TableCell>
                );
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        isOpen={modal.isOpen}
        body={modal.message}
        onConfirm={modal.action}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
}
