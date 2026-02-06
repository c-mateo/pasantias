import { api } from "~/api/api";
import ApplicationStatusBadge from "~/components/ApplicationStatusBadge";
import AdminList2 from "~/components/AdminList2";
import type { AdminApplicationListResponse } from "~/api/types";
import type { Route } from "./+types/Aplicaciones";
import { useList } from "../../util/useList";

export async function clientLoader({}: Route.ClientLoaderArgs) {
  return await api
    .get("/admin/applications?limit=20")
    .json<AdminApplicationListResponse>();
}

export default function Aplicaciones({ loaderData }: Route.ComponentProps) {
  const {
    items,
    hasMore,
    loading,
    loadMore,
    deleteItems,
    sortDescriptor,
    setSortDescriptor,
  } = useList({
    endpoint: "/admin/applications",
    deleteEndpoint: "/admin/applications",
    chunk: 20,
    initialData: loaderData.data,
    initialPage: loaderData.pagination.next,
  });

  const deleteApplication = (id: number) => deleteItems([id]);
  const deleteApplications = (ids: number[]) => deleteItems(ids);

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
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        getId={(r) => r.id}
        getName={(r) => r.user.firstName + " " + r.user.lastName}
        searchColumns={['user.firstName', 'user.lastName', 'offer.position']}
        createHref="/admin/aplicaciones/nuevo"
      />
    </div>
  );
}
