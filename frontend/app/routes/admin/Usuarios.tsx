import { useState } from "react";
import AdminList2 from "~/components/AdminList2";
import type { Route } from "./+types/Usuarios";
import { api } from "~/api/api";

// Admin view of a user
export type AdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  deletedAt?: string | null;
  createdAt: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  // TODO: No existe el endpoint aún
  const res = await api.get("/admin/users?limit=10").res();
  const json = await res.json();
  return {
    initialData: json?.data ?? [],
    pagination: json?.pagination ?? { next: null, prev: null },
  };
}

export default function Usuarios({ loaderData }: Route.ComponentProps) {
  const { initialData, pagination } = loaderData;

  const [users, setUsers] = useState<AdminUser[]>(initialData || []);
  const [page, setPage] = useState(pagination.next);
  const [loading, setLoading] = useState(false);

  const [sort, setSort] = useState<string | undefined>(undefined);

  const loadMore = async () => {
    if (!page || loading) return;
    setLoading(true);
    try {
      const qs = [`limit=10`, `after=${page}`];
      if (sort) qs.push(`sort=${encodeURIComponent(sort)}`);
      const res = await api.get(`/users?${qs.join('&')}`).res();
      const json = await res.json();
      const next = json?.data ?? [];
      setUsers((prev) => [...prev, ...next]);
      setPage(json?.pagination?.next ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /*
  // Search & sort helpers (commented out — kept for future use)
  const searchUsers = async () => {
    setLoading(true);
    try {
      const qs = [`limit=10`];
      if (sort) qs.push(`sort=${encodeURIComponent(sort)}`);
      const res = await api.get(`/users?${qs.join('&')}`).res();
      const json = await res.json();
      setUsers(json?.data ?? []);
      setPage(json?.pagination?.next ?? null);
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
    // searchUsers();
  };
  */

  // AdminList2 handles infinite scroll via loadMore/hasMore

  const deleteUser = (id: number) => setUsers((prev) => prev.filter((u) => u.id !== id));
  const deleteUsers = (ids: number[]) => setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));







  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <AdminList2
        canDelete
        title="Administrar Usuarios"
        columns={[
          { name: "firstName", label: "Nombre" },
          { name: "email", label: "Email", alignment: "center" },
          { name: "role", label: "Rol", alignment: "center" },
          { name: "status", label: "Estado", alignment: "center", renderer: (v) => (v ? "Inactivo" : "Activo") },
        ]}
        items={users}
        loading={loading}
        hasMore={page !== null}
        loadMore={loadMore}
        getId={(u) => u.id}
        getName={(u) => `${u.firstName} ${u.lastName}`}
        onDeleteItem={(id) => deleteUser(id)}
        onDeleteSelected={(ids) => deleteUsers(ids)}
        createHref="/admin/usuarios/nuevo"
      />


    </div>
  );
}
