import React, { useEffect, useState } from "react";
import AdminList2 from "~/components/AdminList2";
import type { Route } from "./+types/Skills";
import { api } from "~/api/api";
import { formatDateTimeLocal } from "~/util/helpers";
import { type AdminSkillListResponse } from "~/api/types";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const res = await api.get("/skills?limit=50").json<AdminSkillListResponse>();
  return {
    initialData: res.data,
    pagination: res.pagination ?? { next: null, prev: null },
  };
}

export default function Skills({ loaderData }: Route.ComponentProps) {
  const { initialData } = loaderData;
  const [items, setItems] = useState(initialData || []);
  const [loading, setLoading] = useState(false);

  const deleteSkill = (id: number) => setItems((prev) => prev.filter((s) => s.id !== id));
  const deleteSkills = (ids: number[]) => setItems((prev) => prev.filter((s) => !ids.includes(s.id)));

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <AdminList2
        canCreate
        canDelete
        title="Administrar Skills"
        columns={[
          { name: "name", label: "Nombre" },
          { name: "createdAt", label: "Creado", alignment: "center", renderer: (v) => v ? formatDateTimeLocal(v) : "N/A" },
        ]}
        items={items}
        loading={loading}
        hasMore={false}
        getId={(s) => s.id}
        getName={(s) => s.name}
        onDeleteItem={(id) => deleteSkill(id)}
        onDeleteSelected={(ids) => deleteSkills(ids)}
        createHref="/admin/skills/nuevo"
      />
    </div>
  );
}
