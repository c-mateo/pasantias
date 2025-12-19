import React, { useEffect, useState } from "react";
import AdminList2 from "~/components/AdminList2";
import { api } from "~/api/api";
import { formatDateTimeLocal } from "~/util/helpers";
import type { AdminDocumentTypeListResponse } from "~/api/types";

export async function clientLoader() {
  const res = await api
    .get("/document-types?limit=100")
    .json<AdminDocumentTypeListResponse>();
  return { initialData: res.data };
}

export default function DocumentTypes({ loaderData }: any) {
  const { initialData } = loaderData;
  const [items, setItems] = useState(initialData || []);
  const [loading, setLoading] = useState(false);

  const deleteItem = (id: number) =>
    setItems((prev) => prev.filter((i) => i.id !== id));
  const deleteItems = (ids: number[]) =>
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));

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
        loading={loading}
        hasMore={false}
        getId={(i) => i.id}
        getName={(i) => i.name}
        onDeleteItem={(id) => deleteItem(id)}
        onDeleteSelected={(ids) => deleteItems(ids)}
        createHref="/admin/document-types/nuevo"
      />
    </div>
  );
}
