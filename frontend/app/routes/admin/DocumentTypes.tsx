import React, { useEffect, useState } from "react";
import AdminList2 from "~/components/AdminList2";
import { api } from "~/api/api";
import { formatDateTimeLocal } from "~/util/helpers";
import type { AdminDocumentTypeListResponse } from "~/api/types";
import { useList } from "../../util/useList";

export async function clientLoader() {
  const res = await api
    .get("/document-types?limit=100")
    .json<AdminDocumentTypeListResponse>();
  return { initialData: res.data };
}

export default function DocumentTypes({ loaderData }: any) {
  const {
    items,
    hasMore,
    loading,
    loadMore,
    deleteItems,
    sortDescriptor,
    setSortDescriptor,
  } = useList<{ id: number; name: string; createdAt?: string }>({
    endpoint: "/document-types",
    deleteEndpoint: "/admin/document-types",
    chunk: 100,
    initialData: loaderData.initialData ?? [],
    initialPage: loaderData.pagination?.next ?? null,
  });

  const deleteItem = (id: number) => deleteItems([id]);
  const deleteItemsLocal = (ids: number[]) => deleteItems(ids);

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <AdminList2
        canCreate
        canDelete
        title="Administrar Tipos de Documentos"
        columns={[
          { name: "name", label: "Nombre" },
          {
            name: "createdAt",
            label: "Creado",
            alignment: "center",
            renderer: (v) => (v ? formatDateTimeLocal(v) : "N/A"),
          },
        ]}
        items={items}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        loadMore={loadMore}
        loading={loading}
        hasMore={hasMore}
        getId={(i) => i.id}
        getName={(i) => i.name}
        onDeleteItem={(id) => deleteItem(id)}
        onDeleteSelected={(ids) => deleteItemsLocal(ids)}
        createHref="/admin/document-types/nuevo"
      />
    </div>
  );
}
