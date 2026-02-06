import type { Route } from "./+types/Carreras";
import { api } from "~/api/api";
import type {
  AdminCourseListResponse,
} from "~/api/types";
import AdminList2 from "~/components/AdminList2";
import { useList } from "../../util/useList";

export async function clientLoader(data: Route.ClientLoaderArgs) {
  return await api.get("/courses?limit=10").json<AdminCourseListResponse>();
}

export default function Carreras({ loaderData }: Route.ComponentProps) {
  const {
    items,
    hasMore,
    loading,
    loadMore,
    deleteItems,
    sortDescriptor,
    setSortDescriptor,
  } = useList({
    endpoint: "/courses",
    deleteEndpoint: "/admin/courses",
    chunk: 20,
    initialData: loaderData.data,
    initialPage: loaderData.pagination.next,
  });

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <AdminList2
        canCreate
        canDelete
        columns={[
          { name: "name", label: "Nombre", sortable: true },
          {
            name: "shortName",
            label: "Sigla",
            alignment: "center",
            sortable: true,
            renderer: (value) => value ?? "N/A",
          },
        ]}
        items={items}
        loading={loading}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        hasMore={hasMore}
        loadMore={loadMore}
        getId={(c) => c.id}
        getName={(c) => c.name}
        onDeleteItem={(id) => deleteItems([id])}
        onDeleteSelected={(ids) => deleteItems(ids)}
        createHref="/admin/carreras/nuevo"
        title="Administrar Carreras"
      />
    </div>
  );
}
