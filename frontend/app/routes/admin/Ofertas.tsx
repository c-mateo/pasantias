import React, { useEffect } from "react";
import AdminList2 from "~/components/AdminList2";
import { formatDateTimeLocal } from "~/util/helpers";
import type { Route } from "./+types/Ofertas";
// Modal handled by AdminList now
import { api } from "~/api/api";
import type { OfferListDTO, AdminOfferListResponse } from "~/api/types";
import { useList } from "../../util/useList";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const res = await api.get("/offers?limit=10").json<AdminOfferListResponse>();
  return {
    initialData: res.data ?? [],
    pagination: res.pagination ?? { next: null, prev: null },
  };
}

export default function Ofertas({ loaderData }: Route.ComponentProps) {
  const {
    items,
    hasMore,
    loading,
    loadMore,
    deleteItems,
    sortDescriptor,
    setSortDescriptor,
  } = useList<OfferListDTO>({
    endpoint: "/offers",
    deleteEndpoint: "/admin/offers",
    chunk: 10,
    initialData: loaderData.initialData ?? [],
    initialPage: loaderData.pagination?.next ?? null,
  });

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <AdminList2
        canCreate
        canDelete
        title="Administrar Ofertas"
        columns={[
          { name: "position", label: "Puesto", sortable: true },
          { name: "company", label: "Empresa", alignment: "center", sortable: true, renderer: (v) => v.name ?? "N/A" },
          { name: "vacancies", label: "Vacantes", alignment: "center" },
          { name: "expiresAt", label: "Fecha Límite", alignment: "center", renderer: (v) => (v ? formatDateTimeLocal(v) : "N/A") },
        ]}
        items={items}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
        getId={(o) => o.id}
        getName={(o) => o.position}
        onDeleteItem={(id) => deleteItems([id])}
        onDeleteSelected={(ids) => deleteItems(ids)}
        createHref="/admin/ofertas/nuevo"
      />

    </div>
  );
}
