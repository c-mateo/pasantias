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


export function useList<T extends { id: number;[key: string]: any; }>(options: {
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

    // Prepare data
    // const newOutput = Array.from(items.values());
    // .filter((item) => {
    //   // Apply filtering here if needed
    //   if (filterDescriptor) {
    //     const results = filterDescriptor.contraints.map((constraint) => {
    //       const itemValue = item[constraint.field];
    //       const constraintValue = constraint.value;
    //       switch (constraint.operator) {
    //         case "eq":
    //           return itemValue === constraintValue;
    //         case "neq":
    //           return itemValue !== constraintValue;
    //         case "lt":
    //           return itemValue < constraintValue;
    //         case "lte":
    //           return itemValue <= constraintValue;
    //         case "gt":
    //           return itemValue > constraintValue;
    //         case "gte":
    //           return itemValue >= constraintValue;
    //         case "contains":
    //           if (typeof itemValue === "string" && typeof constraintValue === "string") {
    //             return itemValue.includes(constraintValue);
    //           }
    //           return false;
    //         default:
    //           return false;
    //       }
    //     });
    //     if (filterDescriptor.logic === "and") {
    //       return results.every((res) => res);
    //     } else {
    //       return results.some((res) => res);
    //     }
    //   }
    //   return true;
    // });
    // function isStringOrNull(aValue: any) {
    //   return aValue === null || typeof aValue === "string";
    // }
    // function isNumberOrNull(aValue: any) {
    //   return aValue === null || typeof aValue === "number";
    // }
    // Apply sorting
    // if (sortDescriptor) {
    // console.log('Sorting by', sortDescriptor.column, sortDescriptor.direction);
    // newOutput.sort((a, b) => {
    //   const aValue = a[sortDescriptor.column];
    //   const bValue = b[sortDescriptor.column];
    //   if (isStringOrNull(aValue) && isStringOrNull(bValue)) {
    //     const aStr = aValue as string | null;
    //     const bStr = bValue as string | null;
    //     if (aStr === null && bStr === null) return 0;
    //     if (aStr === null)
    //       return sortDescriptor.direction === "ascending" ? 1 : -1;
    //     if (bStr === null)
    //       return sortDescriptor.direction === "ascending" ? -1 : 1;
    //     return sortDescriptor.direction === "ascending"
    //       ? aStr.localeCompare(bStr)
    //       : bStr.localeCompare(aStr);
    //   }
    //   if (isNumberOrNull(aValue) && isNumberOrNull(bValue)) {
    //     const aNum = aValue as number | null;
    //     const bNum = bValue as number | null;
    //     if (aNum === null && bNum === null) return 0;
    //     if (aNum === null)
    //       return sortDescriptor.direction === "ascending" ? -1 : 1;
    //     if (bNum === null)
    //       return sortDescriptor.direction === "ascending" ? 1 : -1;
    //     return sortDescriptor.direction === "ascending"
    //       ? aNum - bNum
    //       : bNum - aNum;
    //   }
    //   return 0;
    // });
    // }
    // setOutput(newOutput);
    // NOTE: next is set above on success; abort controller cleared in finally
  };

  // const createItem = async (item: T) => {
  //   startTransition(async () => {
  //     mutateOptimistic({ action: "add", items: [item] });
  //     await api.post(item, options.endpoint).res();
  //     setItems((prev) => [...prev, item]);
  //   });
  // };
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
    // Reload data when sortDescriptor or filterDescriptor changes
    console.log("Reloading data due to sort/filter change");
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
