import AdminList2 from "~/components/AdminList2";
import { useList } from "../../util/useList";
import type { Route } from "./+types/Usuarios";
import { api } from "~/api/api";

/**
 * Usuario mostrado en la vista administrativa.
 * Campos incluidos para las tablas de administración.
 */
export type AdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  deletedAt?: string | null;
  createdAt: string;
};

/**
 * Carga inicial de datos para la vista de usuarios.
 * Intenta leer `/admin/users` y devolver estructura esperada por el cliente.
 * Si el endpoint no existe o falla, se devuelven arrays vacíos como fallback.
 */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const res = await api.get("/admin/users?limit=10").res();
  const json = await res.json();
  return {
    initialData: json?.data ?? [],
    pagination: json?.pagination ?? { next: null, prev: null },
  };
}

/**
 * Componente de administración de usuarios.
 * Usa el hook `useList` para paginación, orden y eliminación.
 */
export default function Usuarios({ loaderData }: Route.ComponentProps) {
  const {
    items,
    hasMore,
    loading,
    loadMore,
    deleteItems,
    sortDescriptor,
    setSortDescriptor,
  } = useList<AdminUser>({
    endpoint: "/admin/users",
    deleteEndpoint: "/admin/users",
    chunk: 10,
    initialData: loaderData.initialData ?? [],
    initialPage: loaderData.pagination?.next ?? null,
  });


  const deleteUser = (id: number) => deleteItems([id]);
  const deleteUsers = (ids: number[]) => deleteItems(ids);

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <AdminList2
        canDelete
        title="Administrar Usuarios"
        columns={[
          { name: "firstName", label: "Nombre" },
          { name: "email", label: "Correo electrónico", alignment: "center" },
          { name: "role", label: "Rol", alignment: "center" },
          { name: "status", label: "Estado", alignment: "center", renderer: (v) => (v ? "Inactivo" : "Activo") },
        ]}
        items={items}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        getId={(u) => u.id}
        getName={(u) => `${u.firstName} ${u.lastName}`}
        onDeleteItem={(id) => deleteUser(id)}
        onDeleteSelected={(ids) => deleteUsers(ids)}
        createHref="/admin/usuarios/nuevo"
      />
    </div>
  );
}
