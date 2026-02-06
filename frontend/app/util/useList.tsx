import type { SortDescriptor } from "@heroui/react";
import { useState, useOptimistic, startTransition, useEffect } from "react";
import { api } from "~/api/api";
import type { Paginated } from "~/api/types";

type FilterContraint = {
  field: string;
  operator: "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "contains";
  value: string | number | boolean;
};

type FilterDescriptor = {
  contraints: FilterContraint[];
  logic: "and" | "or";
};


/**
 * Hook reutilizable para listas paginadas en el frontend.
 * - `endpoint`: ruta base para lectura.
 * - `chunk`: tamaño de página.
 * - `initialData`/`initialPage`: datos/página inicial proporcionados por el loader.
 */
export function useList<T extends { id: number; [key: string]: any }>(options: {
  endpoint: string;
  chunk: number;
  initialData?: T[];
  initialPage?: number | null;
  deleteEndpoint?: string;
}) {
  const [items, setItems] = useState<T[]>([]);

  const [next, setNext] = useState<number | null>(options.initialPage ?? null);

  const [sortDescriptor, setSortDescriptor] = useState<
    SortDescriptor | undefined
  >(undefined);
  const [filterDescriptor, setFilterDescriptor] = useState<FilterDescriptor | null>(null);

  const [abortController, setAbortController] = useState<AbortController | null>(null);

  type AddMutation = {
    action: "add";
    items: T[];
  };
  type RemoveMutation = {
    action: "remove";
    ids: number[];
  };

  const [optimistic, mutateOptimistic] = useOptimistic(
    items,
    (items, data: AddMutation | RemoveMutation) => {
      if (data.action === "add") {
        return [...items, ...data.items];
      } else if (data.action === "remove") {
        return items.filter((item) => !data.ids.includes(item.id));
      }
      return items;
    }
  );

  const load = async (force: boolean = false, reset: boolean = false) => {
    // Wait for any ongoing request to finish
    if (abortController && !force) return;

    abortController?.abort();
    const controller = new AbortController();
    setAbortController(controller);

    let url = `${options.endpoint}?limit=${options.chunk}`;
    if (sortDescriptor) {
      const sort = sortDescriptor.direction === "ascending"
        ? sortDescriptor.column
        : `-${sortDescriptor.column}`;
      url += `&sort=${sort}`;
    }
    if (next && !reset) {
      url += `&after=${next}`;
    }

    try {
      const response = await api
        .signal(controller)
        .get(url)
        .json<Paginated<T>>();

      setItems(reset ? response.data : [...items, ...response.data]);
      setNext(response.pagination.next);
    } catch (err: any) {
      console.error("useList load error", err);
      // If the API rejects the provided sort, reset sorting to a safe state
      try {
        const message = err?.meta?.errors?.[0]?.message || err?.message || "";
        if (typeof message === "string" && message.includes("selected sort is invalid")) {
          setSortDescriptor(undefined);
        }
      } catch (e) {
        // ignore
      }
    } finally {
      setAbortController(null);
    }
    // NOTE: `next` y `abortController` ya se gestionan arriba; si se requiere
    // filtrado/orden avanzado en cliente, podemos implementarlo aquí en el futuro.
  };

  // createItem: si se necesita, puede volver a implementarse usando mutateOptimistic
  const deleteItems = async (ids: number[]) => {
    startTransition(async () => {
      mutateOptimistic({ action: "remove", ids });
      try {
        await Promise.all(
          ids.map(async (id) => await api.delete(`${options.deleteEndpoint}/${id}`).res())
        );
        setItems((prev) => prev.filter((c) => !ids.includes(c.id)));
      } catch (err) {
        console.error("deleteItems error", err);
        // revert optimistic removal by reloading
        load(true, true);
      }
    });
  };

  useEffect(() => {
    // Recargar datos cuando cambian orden o filtros.
    load(true, true);
  }, [sortDescriptor, filterDescriptor]);

  return {
    items: optimistic,
    loadMore: () => load(false),
    loading: abortController !== null,
    hasMore: next !== null,
    deleteItems,
    sortDescriptor,
    setSortDescriptor: setSortDescriptor,
  };
}
