import { useState, useMemo, type ReactNode } from "react";
import ActionButtons from "./ActionButtons";
import { Button } from "@heroui/button";
import { Modal } from "./Modal";
import {
  getKeyValue,
  Spinner,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  type Selection,
  type SortDescriptor,
} from "@heroui/react";
import { useRef } from "react";
import { useIntersectionObserver } from "~/hooks/useIntersectionObserver";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useNavigate } from "react-router";
import { createSetters } from "~/util/createSetters";
import Fuse, { type FuseOptionKey } from 'fuse.js'
import SearchIcon from "app/assets/search.svg?react";

export type Header<T> = {
  label: ReactNode;
  // Hack to allow both keyof T and arbitrary string keys
  name: keyof T | (string & {});
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
  columns?: Header<T>[];
  searchColumns?: FuseOptionKey<T>[];
  onDeleteItem?: (id: number) => void; // invoked after confirm
  onDeleteSelected?: (ids: number[]) => void; // invoked after confirm
  sortDescriptor?: SortDescriptor;
  onSortChange?: (sortDescriptor: SortDescriptor | undefined) => void;
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
      onDelete={() => {
        handleDeleteItem();
      }}
      editHref={
        createHref
          ? createHref.replace(/nuevo$/, item.id.toString())
          : undefined
      }
    />
  );
};

export default function AdminList2<
  T extends { id: number } & Record<string, any>,
>({
  title,
  items,
  getId,
  getName,
  columns,
  searchColumns,
  onDeleteItem,
  onDeleteSelected,
  sortDescriptor,
  onSortChange,
  createHref,
  loading,
  canCreate,
  canDelete,
  hasMore,
  loadMore,
  rowActions = defaultActions,
}: AdminListProps<T>) {
  const [filterValue, setFilterValue] = useState("");
  const [selection, setSelection] = useState<Selection>(new Set());

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
    const name = items.find((it) => getId(it) === id);
    const displayName = getDisplayName(name);
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

  const columnSettings: Header<T>[] = [
    ...(columns ?? []),
    {
      label: "Acciones",
      name: "actions",
      alignment: "center",
    },
  ];

  const columnLookup = indexBy<Header<T>>(columnSettings, "name");

  const [desktopLoaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: loadMore,
    shouldUseLoader: true,
  });
  const mobileLoaderRef = useRef<HTMLDivElement | null>(null);

  useIntersectionObserver(mobileLoaderRef, () => {
    if (hasMore && loadMore && !loading) loadMore();
  }, { root: null, threshold: 0.1 });

  const navigate = useNavigate();

  const fuse = searchColumns ? new Fuse(items, { threshold: 0.6, keys: searchColumns.map(String) }) : null;

  const filteredItems = useMemo(() => {
    if (!filterValue) return items;
    if (fuse) {
      return fuse.search(filterValue).map(result => result.item);
    }

    const fv = filterValue.toLowerCase();
    return items.filter((item) =>
      getDisplayName(item).toLowerCase().includes(fv),
    );
  }, [items, filterValue]);

  const topBlock = (
    <div className="flex flex-col">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="w-full flex justify-between items-center gap-2 mt-4 mb-2">
        <Input
          isClearable
          className="w-full max-w-md"
          placeholder="Buscar..."
          startContent={<SearchIcon className="h-4 w-4" />}
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={(v: any) => setFilterValue(v)}
        />
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
              className="inline-flex items-center justify-center px-4 py-2 text-sm"
              radius="md"
              onPress={() => navigate(createHref)}
            >
              Crear
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden sm:block">
        <Table
          isHeaderSticky
          selectionMode="multiple"
          selectedKeys={selection}
          baseRef={scrollerRef}
          onSelectionChange={setSelection}
          aria-label="Administrar"
          className="h-[80vh]"
          sortDescriptor={sortDescriptor}
          onSortChange={onSortChange}
          bottomContent={
            hasMore ? (
              <div ref={desktopLoaderRef} className="flex w-full justify-center">
                <Spinner color="white" />
              </div>
            ) : null
          }
          topContentPlacement="outside"
          topContent={topBlock}
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
            items={filteredItems}
            loadingContent={<Spinner label="Loading..." />}
          >
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => {
                  if (columnKey === "actions") {
                    return (
                      <TableCell>
                        {rowActions(item, {
                          createHref,
                          handleDeleteItem: createDeleteItemHandler(item.id),
                        })}
                      </TableCell>
                    );
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
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden">
        {topBlock}
        <div className="flex flex-col mt-2">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-md p-3 mb-3">
              <div className="flex items-start justify-between">
                <div className="text-base font-semibold">{getDisplayName(item)}</div>
                <div>{rowActions(item, { createHref, handleDeleteItem: createDeleteItemHandler(item.id) })}</div>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                {columns?.map((col) => {
                  if (col.name === 'actions') return null as any;
                  const key = col.name as string;
                  const renderer = columnLookup[key]?.renderer;
                  // @ts-ignore
                  const value = (item as any)[key];
                  return (
                    <div key={key} className="flex gap-2 py-1">
                      <div className="font-medium w-32 text-gray-500">{col.label}:</div>
                      <div className="flex-1">{renderer ? renderer(value) : String(value ?? 'N/A')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {hasMore && (
            <div ref={mobileLoaderRef} className="flex w-full justify-center py-4">
              <Spinner color="white" />
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        body={modal.message}
        onConfirm={modal.action}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
}