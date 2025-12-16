import React, { useEffect, useRef, useState } from "react";
import AdminList from "~/components/AdminList";
import { Button } from "@heroui/button";
import type { Route } from "./+types/Usuarios";
import { Modal } from "../../components/Modal";
import { api } from "~/api/api";
import { useIntersectionObserver } from "~/hooks/useIntersectionObserver";
import type { UserListResponse } from "~/api/types";

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
  const res = await api.get("/admin/users?limit=10").json<UserListResponse>();

  return {
    initialData: res?.data ?? [],
    pagination: res?.pagination ?? { next: null, prev: null },
  };
}

export default function Usuarios({ loaderData }: Route.ComponentProps) {
  const { initialData, pagination } = loaderData;

  const [users, setUsers] = useState(initialData || []);
  const [page, setPage] = useState(pagination.next);
  const [loading, setLoading] = useState(false);
  // selection & modal handled by AdminList now

  const sentinelRef = useRef<HTMLTableRowElement>(null);

  // AdminList manages the header checkbox behaviour

  // selection handled by AdminList

  const loadMore = async () => {
    if (!page || loading) return;
    setLoading(true);
    try {
      const res = await api.get(`/users?limit=10&after=${page}`).json<UserListResponse>();
      const next = res?.data ?? [];
      setUsers((prev) => [...prev, ...next]);
      setPage(res?.pagination?.next ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useIntersectionObserver(sentinelRef, loadMore);

  useEffect(() => {
    if (!page) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loading) {
        loadMore();
      }
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [page, loading, loadMore]);

  const deleteUser = (id: number) => setUsers((prev) => prev.filter((u) => u.id !== id));
  const deleteUsers = (ids: number[]) => setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));

  // AdminList will show delete confirmation modals

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      {/* AdminList handles confirmation modals */}
      {/* AdminList shows title and actions */}
      <AdminList<AdminUser>
        headers={[
          { label: "Nombre" },
          { label: "Email", className: "px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300" },
          { label: "Rol", className: "px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300" },
          { label: "Estado", className: "px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300" },
        ]}
        items={users}
        loading={loading}
        sentinelRef={sentinelRef}
        getId={(u) => u.id}
        getName={(u) => `${u.firstName} ${u.lastName}`}
            renderCells={(user) => (
              <>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">{user.email}</td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">{user.role}</td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">{(user as any).deletedAt ? "Inactivo" : "Activo"}</td>
              </>
            )}
            onDeleteItem={(id) => deleteUser(id)}
            onDeleteSelected={(ids) => deleteUsers(ids)}
            title="Administrar Usuarios"
          />
    </div>
  );
}
