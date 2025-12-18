import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import AdminList2 from "~/components/AdminList2";
import { Input } from "@heroui/react";
import type { Route } from "./+types/Usuarios";
import { Modal } from "../../components/Modal";
import { api } from "~/api/api";
import type { UserListResponse } from "~/api/types";
import ActionButtons from "~/components/ActionButtons";
import toast from "~/util/toast";

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


  // User detail modal state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editingCuil, setEditingCuil] = useState("");
  const [editingIsAdmin, setEditingIsAdmin] = useState(false);
  const [editingLoading, setEditingLoading] = useState(false);

  const openUser = async (id: number) => {
    try {
      const res = await api.get(`/admin/users/${id}`).res();
      const json = await res.json();
      const u = json?.data ?? json;
      setEditingUser(u);
      setEditingCuil(u?.cuil ?? "");
      setEditingIsAdmin((u?.role ?? "USER") === "ADMIN");
    } catch (err) {
      console.error(err);
      toast.error({ title: "Error", message: "No se pudo cargar el usuario" });
    }
  };

  const closeUserModal = () => {
    setEditingUser(null);
    setEditingCuil("");
    setEditingIsAdmin(false);
  };

  const saveUser = async () => {
    if (!editingUser) return;
    setEditingLoading(true);
    try {
      const payload: any = { cuil: editingCuil };
      if (editingIsAdmin) payload.role = "ADMIN";
      else payload.role = "USER";
      const res = await api.patch({ ...payload }, `/admin/users/${editingUser.id}`).res();
      await res.json();
      // update local list
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, cuil: editingCuil, role: payload.role } : u)));
      toast.success({ title: "Usuario actualizado" });
      closeUserModal();
    } catch (err) {
      console.error(err);
      toast.error({ title: "Error", message: "No se pudo actualizar el usuario" });
    } finally {
      setEditingLoading(false);
    }
  };




  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <AdminList2
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

      {/* User edit modal */}
      {editingUser ? (
        <div className="fixed z-20 inset-0 bg-black/25 flex items-center justify-center">
          <div className="max-w-xl bg-white p-6 rounded shadow-md w-full">
            <h3 className="text-xl font-semibold mb-4">Editar usuario</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm text-default-500">Nombre</label>
                <div className="text-lg font-medium">{editingUser.firstName} {editingUser.lastName}</div>
              </div>
              <div>
                <label className="text-sm text-default-500">Email</label>
                <div className="text-sm">{editingUser.email}</div>
              </div>
              <div>
                <label className="text-sm text-default-500">CUIL</label>
                <Input value={editingCuil} onValueChange={setEditingCuil} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isAdmin" checked={editingIsAdmin} onChange={(e) => setEditingIsAdmin(e.target.checked)} />
                <label htmlFor="isAdmin" className="text-sm">Es administrador</label>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <Button color="default" onPress={closeUserModal} radius="md">Cancelar</Button>
              <Button color="primary" onPress={saveUser} radius="md" disabled={editingLoading}>{editingLoading ? 'Guardando...' : 'Guardar'}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
