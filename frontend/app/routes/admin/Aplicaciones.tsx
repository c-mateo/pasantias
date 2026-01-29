import { useState } from "react";
import { api } from "~/api/api";
import ApplicationStatusBadge from "~/components/ApplicationStatusBadge";
import AdminList2 from "~/components/AdminList2";
import type { AdminApplicationListResponse, Paginated } from "~/api/types";
import type { Route } from "./+types/Aplicaciones";

export async function clientLoader({}: Route.ClientLoaderArgs) {
  return await api
    .get("/admin/applications?limit=20")
    .json<AdminApplicationListResponse>();
}

type UseListProps<T> = {
  endpoint: string;
  chunk: number;
  loaderData: Paginated<T>;
};

export const useList = <T extends { id: number }>({
  endpoint,
  chunk,
  loaderData,
}: UseListProps<T>) => {
  if (chunk < 10 || chunk > 100)
    throw new Error("Chunk must be between 10 and 100");

  const [page, setPage] = useState(loaderData.pagination.next);
  const [data, setData] = useState(loaderData.data);
  const [loading, setLoading] = useState(false);

  // const setLoading = (loading: boolean) => {
  //   _setLoading(loading);
  //   onLoadingChange(loading);
  // };

  const loadMore = async () => {
    if (!page || loading) return;
    setLoading(true);
    try {
      const res = await api
        .get(`${endpoint}?limit=${chunk}&after=${page}`)
        .json<Paginated<T>>();
      const next = res?.data ?? [];
      setData((prev) => [...prev, ...next]);
      setPage(res.pagination.next);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteItems = async (ids: number[]) => {
    setData((prev) => prev.filter((c) => !ids.includes(c.id)));
  };

  return { items: data, hasMore: !!page, loading, loadMore, deleteItems };
};

export default function Aplicaciones({ loaderData }: Route.ComponentProps) {
  const { items, hasMore, loading, loadMore, deleteItems } = useList({
    endpoint: "/admin/applications",
    chunk: 20,
    loaderData,
  });

  /*
  // Search/sort (commented out — kept for future use)
  const [sort, setSort] = useState<string | undefined>(undefined);
  */
  const deleteApplication = (id: number) => deleteItems([id]);
  const deleteApplications = (ids: number[]) => deleteItems(ids);
  /*
  // Search & sort helpers (commented out — kept for future use)
  const searchApplications = async () => {
    setLoading(true);
    try {
      const qs = [`limit=20`];
      if (sort) qs.push(`sort=${encodeURIComponent(sort)}`);
      const res = await api.get(`/admin/applications?${qs.join('&')}`).res();
      const json = await res.json();
      setApplications(json?.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cycleSort = (field: string) => {
    if (sort === field) setSort(`-${field}`);
    else if (sort === `-${field}`) setSort(undefined);
    else setSort(field);
    // searchApplications();
  };
  */
  // AdminList2 will handle selection/confirmations

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <AdminList2
        title="Administrar Aplicaciones"
        columns={[
          {
            name: "user",
            label: "Candidato",
            renderer: (v) => {
              return v ? v.firstName + " " + v.lastName : "N/A";
            },
          },
          {
            name: "offer",
            label: "Oferta",
            renderer: (v) => v?.position ?? "N/A",
          },
          {
            name: "status",
            label: "Estado",
            alignment: "center",
            renderer: (v) => (
              <div className="flex items-center gap-2 justify-center">
                <ApplicationStatusBadge status={v} />
              </div>
            ),
          },
        ]}
        items={items}
        hasMore={hasMore}
        loadMore={loadMore}
        getId={(r) => r.id}
        getName={(r) => r.user?.firstName ?? "N/A"}
        createHref="/admin/aplicaciones/nuevo"
      />
    </div>
  );
}
